import os
import requests as http_requests  # renamed to avoid clash with DRF request
from django.http import JsonResponse
from django.views.decorators.http import require_GET
from django.contrib.auth.hashers import make_password, check_password
from dotenv import load_dotenv

from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import Customer, Vehicle, Employee, Appointment, SiteService, BusinessInformation
from .serializer import (
    CustomerRegistrationSerializer,
    CustomerProfileSerializer,
    EmployeeRegistrationSerializer,
    VehicleSerializer,
    EmployeeProfileSerializer,
    AppointmentSerializer,
    AppointmentReadSerializer,
    CustomTokenObtainPairSerializer,
    SiteServiceSerializer,
    BusinessInformationSerializer,
)
from django.utils import timezone
import datetime
from django.contrib.auth.hashers import make_password
import random, time
from .authentication import (
    CustomJWTAuthentication,
    get_tokens_for_customer,
    get_tokens_for_employee,
)

# Load environment variables
load_dotenv()


#Facebook Posts View
class FacebookPostsView(APIView):
    def get(self, request):
        PAGE_ID = os.getenv('PAGE_ID', '1018524308015125')
        ACCESS_TOKEN = os.getenv('FACEBOOK_ACCESS_TOKEN', 'EAAU2z6ZC17KgBQzZANCfG90AkhNCNZA36dC5p1OxZB2sY9Y5UAVii01F6mexQ3AhDSJRaSMjmI71oXB4X4RiPJ0nZCiEzClZCTt7HeoqKy9OLakFKKZCyEvZAZCpFFIbKr1wpLkzjnse1ZBqjVUqbavpdkIjykeskmXDWcugyFZCZB5Gc9AyPz0KRRN5hzUm1Qv9dQ07ACUq5OBupZCVBbTpGKFO40Btc7YYRhPLX5RPAv0cjOPjv')
        if not PAGE_ID or not ACCESS_TOKEN:
            return JsonResponse({'error': 'Missing Facebook credentials'}, status=500)
        url = f'https://graph.facebook.com/v19.0/{PAGE_ID}/posts?fields=message,created_time,id,full_picture,attachments&access_token={ACCESS_TOKEN}'
        try:
            response = http_requests.get(url)
            data = response.json()
            return JsonResponse(data)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)

# ══════════════════════════════════════════════════════════════════
#  Helper permissions
# ══════════════════════════════════════════════════════════════════

class IsCustomer(permissions.BasePermission):
    """Allow only authenticated Customer instances."""
    def has_permission(self, request, view):
        return isinstance(request.user, Customer)


class IsEmployee(permissions.BasePermission):
    """Allow only authenticated Employee instances."""
    def has_permission(self, request, view):
        return isinstance(request.user, Employee)


class IsAdmin(permissions.BasePermission):
    """Allow only employees whose role is 'admin'."""
    def has_permission(self, request, view):
        return isinstance(request.user, Employee) and request.user.role == 'admin'


class IsCustomerOrEmployee(permissions.BasePermission):
    """Allow any authenticated Customer or Employee."""
    def has_permission(self, request, view):
        return isinstance(request.user, (Customer, Employee))


# ══════════════════════════════════════════════════════════════════
#  Customer auth
# ══════════════════════════════════════════════════════════════════

class CustomerRegisterView(APIView):
    """POST /api/customers/register/"""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = CustomerRegistrationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        customer = serializer.save()
        tokens = get_tokens_for_customer(customer)
        return Response({
            'customer': CustomerProfileSerializer(customer).data,
            **tokens,
        }, status=status.HTTP_201_CREATED)


class CustomerLoginView(APIView):
    """POST /api/customers/login/"""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email', '').strip()
        password = request.data.get('password', '')

        if not email or not password:
            return Response(
                {'detail': 'Email and password are required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            customer = Customer.objects.get(email=email)
        except Customer.DoesNotExist:
            return Response(
                {'detail': 'Invalid email or password.'},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        if not check_password(password, customer.password_hash):
            return Response(
                {'detail': 'Invalid email or password.'},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        tokens = get_tokens_for_customer(customer)
        return Response({
            'customer': CustomerProfileSerializer(customer).data,
            **tokens,
        })


class CustomerProfileView(APIView):
    """GET / PUT  /api/customers/me/"""
    authentication_classes = [CustomJWTAuthentication]
    permission_classes = [IsCustomer]

    def get(self, request):
        serializer = CustomerProfileSerializer(request.user)
        return Response(serializer.data)

    def put(self, request):
        serializer = CustomerProfileSerializer(
            request.user, data=request.data, partial=True,
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


# ══════════════════════════════════════════════════════════════════
#  Employee / Admin auth
# ══════════════════════════════════════════════════════════════════

class EmployeeLoginView(APIView):
    """POST /api/employees/login/  (also serves /api/login/ for staff)"""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email', '').strip()
        password = request.data.get('password', '')

        if not email or not password:
            return Response(
                {'detail': 'Email and password are required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            employee = Employee.objects.get(email=email)
        except Employee.DoesNotExist:
            return Response(
                {'detail': 'Invalid email or password.'},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        if not check_password(password, employee.password_hash):
            return Response(
                {'detail': 'Invalid email or password.'},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        tokens = get_tokens_for_employee(employee)
        return Response({
            'employee': EmployeeProfileSerializer(employee).data,
            'token': tokens['access'],      # Login.js reads response.token
            'redirect': '/admin',            # Login.js reads response.redirect
            **tokens,
        })

class AdminEmployeeCreateView(APIView):
    """POST /api/admin/employees/"""
    authentication_classes = [CustomJWTAuthentication]
    permission_classes = [IsAdmin]

    def post(self, request):
        serializer = EmployeeRegistrationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        employee = serializer.save()
        return Response(EmployeeRegistrationSerializer(employee).data, status=status.HTTP_201_CREATED)

class AdminEmployeeDeleteView(APIView):
    """DELETE /api/admin/employees/<employee_id>/"""
    authentication_classes = [CustomJWTAuthentication]
    permission_classes = [IsAdmin]

    def delete(self, request, employee_id):
        try:
            employee = Employee.objects.get(employee_id=employee_id)
        except Employee.DoesNotExist:
            return Response({'detail': 'Employee not found.'}, status=status.HTTP_404_NOT_FOUND)
        employee.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
class AdminEmployeeEditView(APIView):
    """PUT /api/admin/employees/<employee_id>/"""
    authentication_classes = [CustomJWTAuthentication]
    permission_classes = [IsAdmin]

    def put(self, request, employee_id):
        try:
            employee = Employee.objects.get(employee_id=employee_id)
        except Employee.DoesNotExist:
            return Response({'detail': 'Employee not found.'}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = EmployeeRegistrationSerializer(employee, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(EmployeeRegistrationSerializer(employee).data)
    
# ══════════════════════════════════════════════════════════════════
#  Vehicles (customer‑scoped)
# ══════════════════════════════════════════════════════════════════

class VehicleListCreateView(APIView):
    """
    GET  /api/vehicles/       → list the logged-in customer's vehicles
    POST /api/vehicles/       → add a vehicle to the logged-in customer
    """
    authentication_classes = [CustomJWTAuthentication]
    permission_classes = [IsCustomer]

    def get(self, request):
        vehicles = Vehicle.objects.filter(customer=request.user)
        serializer = VehicleSerializer(vehicles, many=True)
        return Response(serializer.data)

    def post(self, request):
        data = request.data.copy()
        data['customer'] = request.user.customer_id
        serializer = VehicleSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class VehicleDetailView(APIView):
    """
    GET / PUT / DELETE  /api/vehicles/<vehicle_id>/
    """
    authentication_classes = [CustomJWTAuthentication]
    permission_classes = [IsCustomer]

    def _get_vehicle(self, request, vehicle_id):
        try:
            return Vehicle.objects.get(
                vehicle_id=vehicle_id, customer=request.user,
            )
        except Vehicle.DoesNotExist:
            return None

    def get(self, request, vehicle_id):
        vehicle = self._get_vehicle(request, vehicle_id)
        if not vehicle:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        return Response(VehicleSerializer(vehicle).data)

    def put(self, request, vehicle_id):
        vehicle = self._get_vehicle(request, vehicle_id)
        if not vehicle:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        data = request.data.copy()
        data['customer'] = request.user.customer_id
        serializer = VehicleSerializer(vehicle, data=data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def delete(self, request, vehicle_id):
        vehicle = self._get_vehicle(request, vehicle_id)
        if not vehicle:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        vehicle.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# ══════════════════════════════════════════════════════════════════
#  Appointments
# ══════════════════════════════════════════════════════════════════

class AppointmentListCreateView(APIView):
    """
    GET  /api/appointments/   → customer sees own, employee sees all
    POST /api/appointments/   → create appointment

    This view accepts two POST styles:
    1) Authenticated clients: flat data using `vehicle` id (existing behavior).
    2) Public nested payload: includes `contact`, `vehicle` (object with license_plate/manufacturer/model/year),
       and `appointment` (date/time). The view will create/find customer and vehicle as needed and then
       proceed to create the Appointment using the existing serializer.
    """
    # AllowAny so public clients can POST nested payloads; GET will enforce auth manually.
    authentication_classes = [CustomJWTAuthentication]
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        # enforce previous auth behavior for GET
        if not isinstance(request.user, (Customer, Employee)):
            return Response({'detail': 'Authentication required.'}, status=status.HTTP_401_UNAUTHORIZED)

        if isinstance(request.user, Customer):
            vehicle_ids = request.user.vehicles.values_list('vehicle_id', flat=True)
            qs = Appointment.objects.filter(vehicle_id__in=vehicle_ids)
        else:
            qs = Appointment.objects.all()
        serializer = AppointmentReadSerializer(qs, many=True)
        return Response(serializer.data)

    def post(self, request):
        data = request.data.copy() if request.data else {}

        # If this looks like a nested public payload (contains `contact` or vehicle is an object),
        # handle creation of customer/vehicle first.
        if 'contact' in data or isinstance(data.get('vehicle'), dict):
            contact = data.get('contact', {})
            vehicle = data.get('vehicle', {})
            appt = data.get('appointment', {})

            # basic validation
            required = []
            if not contact.get('first_name'):
                required.append('contact.first_name')
            if not contact.get('last_name'):
                required.append('contact.last_name')
            if not contact.get('email'):
                required.append('contact.email')
            if not appt.get('date'):
                required.append('appointment.date')
            if not appt.get('time'):
                required.append('appointment.time')
            if required:
                return Response({'detail': f'Missing fields: {", ".join(required)}'}, status=status.HTTP_400_BAD_REQUEST)

            # find or create customer by email
            email = contact.get('email').strip()
            customer, created = Customer.objects.get_or_create(
                email=email,
                defaults={
                    'first_name': contact.get('first_name', ''),
                    'last_name': contact.get('last_name', ''),
                    'phone': contact.get('phone', ''),
                    'password_hash': make_password(''),
                }
            )

            # resolve vehicle: prefer provided license_plate, else match by make/model/year
            try:
                year_val = int(vehicle.get('year')) if vehicle.get('year') else None
            except (TypeError, ValueError):
                year_val = None

            vehicle_obj = None
            plate_provided = (vehicle.get('license_plate') or '').strip()
            if plate_provided:
                vehicle_obj = Vehicle.objects.filter(license_plate__iexact=plate_provided, customer=customer).first()

            if not vehicle_obj:
                vehicle_qs = Vehicle.objects.filter(customer=customer)
                if vehicle.get('manufacturer'):
                    vehicle_qs = vehicle_qs.filter(make=vehicle.get('manufacturer'))
                if vehicle.get('model'):
                    vehicle_qs = vehicle_qs.filter(model=vehicle.get('model'))
                if year_val:
                    vehicle_qs = vehicle_qs.filter(year=year_val)
                vehicle_obj = vehicle_qs.first()

            if not vehicle_obj:
                plate = plate_provided if plate_provided else f"TMP{int(time.time())}{random.randint(100,999)}"
                vehicle_obj = Vehicle.objects.create(
                    customer=customer,
                    make=vehicle.get('manufacturer') or 'Unknown',
                    model=vehicle.get('model') or 'Unknown',
                    year=year_val or 0,
                    license_plate=plate,
                )

            # parse scheduled_at from date + time
            date_str = appt.get('date')
            time_str = appt.get('time').strip().upper()
            try:
                y, m, d = [int(x) for x in date_str.split('-')]
            except Exception:
                return Response({'detail': 'Invalid appointment.date format, expected YYYY-MM-DD'}, status=status.HTTP_400_BAD_REQUEST)

            hour = None
            try:
                if time_str.endswith('AM') or time_str.endswith('PM'):
                    val = time_str[:-2]
                    hour = int(val) % 12
                    if time_str.endswith('PM'):
                        hour = hour + 12 if hour != 12 else 12
                    if time_str.endswith('AM') and hour == 12:
                        hour = 0
                else:
                    hour = int(time_str)
            except Exception:
                return Response({'detail': 'Invalid appointment.time format'}, status=status.HTTP_400_BAD_REQUEST)

            dt = datetime.datetime(year=y, month=m, day=d, hour=hour, minute=0, second=0)
            # use stdlib UTC tzinfo to avoid AttributeError on django.utils.timezone.utc
            scheduled_at = timezone.make_aware(dt, timezone=datetime.timezone.utc)

            # populate flat data expected by serializer
            # due to appointment step two not being fully implemented, 'General Service' will serve as a placeholder until merging can be resolved
            data['vehicle'] = vehicle_obj.vehicle_id
            data['scheduled_at'] = scheduled_at.isoformat()
            data['service_type'] = data.get('service_type') or 'General Service'

            # proceed to serializer below

        else:
            # Non-nested path: maintain previous authentication/authorization behavior
            # If customer is creating, verify they own the vehicle
            if isinstance(request.user, Customer):
                vehicle_id = data.get('vehicle')
                if not Vehicle.objects.filter(
                    vehicle_id=vehicle_id, customer=request.user,
                ).exists():
                    return Response(
                        {'detail': 'Vehicle not found or not yours.'},
                        status=status.HTTP_400_BAD_REQUEST,
                    )
            # If employee is creating, optionally assign themselves
            if isinstance(request.user, Employee) and not data.get('employee'):
                data['employee'] = request.user.employee_id

        serializer = AppointmentSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            AppointmentReadSerializer(serializer.instance).data,
            status=status.HTTP_201_CREATED,
        )





class AppointmentDetailView(APIView):
    """
    GET / PUT / DELETE  /api/appointments/<appointment_id>/
    """
    authentication_classes = [CustomJWTAuthentication]
    permission_classes = [IsCustomerOrEmployee]

    def _get_appointment(self, request, appointment_id):
        try:
            appt = Appointment.objects.get(appointment_id=appointment_id)
        except Appointment.DoesNotExist:
            return None

        # Customers can only access their own appointments
        if isinstance(request.user, Customer):
            if appt.vehicle.customer.customer_id != request.user.customer_id:
                return None
        return appt

    def get(self, request, appointment_id):
        appt = self._get_appointment(request, appointment_id)
        if not appt:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        return Response(AppointmentReadSerializer(appt).data)

    def put(self, request, appointment_id):
        appt = self._get_appointment(request, appointment_id)
        if not appt:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = AppointmentSerializer(appt, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(AppointmentReadSerializer(serializer.instance).data)

    def delete(self, request, appointment_id):
        appt = self._get_appointment(request, appointment_id)
        if not appt:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        appt.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
# ══════════════════════════════════════════════════════════════════
#  Business Information
# ══════════════════════════════════════════════════════════════════

class BusinessInformationView(APIView):
    authentication_classes = [CustomJWTAuthentication]

    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.AllowAny()]
        return [IsAdmin()]

    def get(self, request):
        qs = BusinessInformation.objects.all()
        serializer = BusinessInformationSerializer(qs, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = BusinessInformationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class BusinessInformationDetailView(APIView):
    authentication_classes = [CustomJWTAuthentication]

    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.AllowAny()]
        # return [IsAdmin()]
        return [permissions.AllowAny()] #temporarily allow anyone to edit business info for dev/testing; change to IsAdmin in production


    def get_object(self, info_id):
        try:
            return BusinessInformation.objects.get(info_id=info_id)
        except BusinessInformation.DoesNotExist:
            return None

    def get(self, request, info_id):
        info = self.get_object(info_id)
        if not info:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = BusinessInformationSerializer(info)
        return Response(serializer.data)

    def put(self, request, info_id):
        info = self.get_object(info_id)
        if not info:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = BusinessInformationSerializer(info, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def delete(self, request, info_id):
        info = self.get_object(info_id)
        if not info:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)

        info.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# ══════════════════════════════════════════════════════════════════
#  Admin-only list views
# ══════════════════════════════════════════════════════════════════

class AdminCustomerListView(APIView):
    """GET /api/admin/customers/"""
    authentication_classes = [CustomJWTAuthentication]
    # permission_classes = [IsEmployee]

    def get(self, request):
        qs = Customer.objects.all().order_by('-created_at')
        serializer = CustomerProfileSerializer(qs, many=True)
        return Response(serializer.data)


class AdminEmployeeListView(APIView):
    """GET /api/admin/employees/"""
    authentication_classes = [CustomJWTAuthentication]
    permission_classes = [IsEmployee]

    def get(self, request):
        qs = Employee.objects.all().order_by('last_name', 'first_name')
        serializer = EmployeeProfileSerializer(qs, many=True)
        return Response(serializer.data)
    

class AdminAppointmentListView(APIView):
    """GET /api/admin/appointments/"""
    authentication_classes = [CustomJWTAuthentication]
    permission_classes = [IsEmployee]

    def get(self, request):
        qs = Appointment.objects.all()
        serializer = AppointmentReadSerializer(qs, many=True)
        return Response(serializer.data)


class AdminVehicleListView(APIView):
    """GET /api/admin/vehicles/"""
    authentication_classes = [CustomJWTAuthentication]
    permission_classes = [IsEmployee]

    def get(self, request):
        qs = Vehicle.objects.select_related('customer').all()
        serializer = VehicleSerializer(qs, many=True)
        return Response(serializer.data)


class SiteServiceListCreateView(APIView):
    authentication_classes = []   # no auth needed for dev
    permission_classes = [permissions.AllowAny]  # TODO: restrict to IsAdmin for writes in production

    def get(self, request):
        if request.query_params.get('all') == 'true':
            qs = SiteService.objects.all()
        else:
            qs = SiteService.objects.filter(is_active=True)
        serializer = SiteServiceSerializer(qs, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = SiteServiceSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class SiteServiceDetailView(APIView):
    authentication_classes = []   # no auth needed for dev
    permission_classes = [permissions.AllowAny]  # TODO: restrict to IsAdmin for writes in production

    def get_object(self, service_id):
        try:
            return SiteService.objects.get(service_id=service_id)
        except SiteService.DoesNotExist:
            return None

    def get(self, request, service_id):
        service = self.get_object(service_id)
        if not service:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = SiteServiceSerializer(service)
        return Response(serializer.data)

    def put(self, request, service_id):
        service = self.get_object(service_id)
        if not service:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = SiteServiceSerializer(service, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def delete(self, request, service_id):
        service = self.get_object(service_id)
        if not service:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        service.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class ContactMessageView(APIView):
    """POST /api/contact/"""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        required = ['fname', 'lname', 'email', 'message']
        missing = [f for f in required if not request.data.get(f)]
        if missing:
            return Response(
                {'detail': f'Missing fields: {", ".join(missing)}'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        # TODO: store in a Message model or send email
        return Response({'detail': 'Message received.'}, status=status.HTTP_201_CREATED)

class AdminDashboardTotalsView(APIView):
    """GET /api/admin/dashboard-totals/"""
    authentication_classes = [CustomJWTAuthentication]

    def get(self, request):
        total_customers = Customer.objects.count()
        total_appointments = Appointment.objects.count()
        total_messages = 0  # Placeholder since messages aren't stored yet
        total_services = SiteService.objects.count()
        return Response({
            'total_customers': total_customers,
            'total_appointments': total_appointments,
            'total_messages': total_messages,
            'total_services': total_services,
        })
    
class AdminRecentCustomersView(APIView):
    """GET /api/admin/recent-customers/"""
    authentication_classes = [CustomJWTAuthentication]

    def get(self, request):
        recent_customers = Customer.objects.all().order_by('-created_at')[:5]
        serializer = CustomerProfileSerializer(recent_customers, many=True)
        return Response(serializer.data)

@require_GET
def place_reviews(request):
    """
    Fetch Google Maps place reviews for a business.
    """
    api_key = os.getenv("GOOGLE_MAPS_API_KEY")
    if not api_key:
        return JsonResponse({"error": "API key not configured"}, status=500)

    place_id = request.GET.get("place_id")
    business_name = request.GET.get("name", "Royal Auto And Body Repair, Sacramento, CA")

    if not place_id:
        if not business_name:
            return JsonResponse({"error": "Either place_id or name parameter is required"}, status=400)

        find_url = "https://maps.googleapis.com/maps/api/place/findplacefromtext/json"
        params = {
            "input": business_name,
            "inputtype": "textquery",
            "fields": "place_id",
            "key": api_key,
        }
        try:
            response = http_requests.get(find_url, params=params, timeout=10)
            response.raise_for_status()
            data = response.json()
            if not data.get("candidates"):
                return JsonResponse({"error": "Business not found"}, status=404)
            place_id = data["candidates"][0]["place_id"]
        except http_requests.exceptions.RequestException as e:
            return JsonResponse({"error": f"Failed to get place_id: {str(e)}"}, status=500)

    details_url = "https://maps.googleapis.com/maps/api/place/details/json"
    params = {
        "place_id": place_id,
        "fields": "name,rating,reviews",
        "key": api_key,
    }
    try:
        response = http_requests.get(details_url, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()
        if data.get("status") != "OK":
            return JsonResponse({"error": data.get("error_message", "Invalid place_id")}, status=400)
        return JsonResponse(data)
    except http_requests.exceptions.Timeout:
        return JsonResponse({"error": "Request to Google Maps API timed out"}, status=504)
    except http_requests.exceptions.RequestException as e:
        return JsonResponse({"error": f"Request failed: {str(e)}"}, status=500)


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        tokens = serializer.validated_data
        response = Response(tokens)
        return response
