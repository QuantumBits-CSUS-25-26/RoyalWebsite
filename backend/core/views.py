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

from .models import Customer, Vehicle, Employee, Appointment
from .serializer import (
    CustomerRegistrationSerializer,
    CustomerProfileSerializer,
    VehicleSerializer,
    EmployeeProfileSerializer,
    AppointmentSerializer,
    AppointmentReadSerializer,
    CustomTokenObtainPairSerializer,
)
from .authentication import (
    CustomJWTAuthentication,
    get_tokens_for_customer,
    get_tokens_for_employee,
)

# Load environment variables
load_dotenv()


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
    POST /api/appointments/   → create appointment (customer or employee)
    """
    authentication_classes = [CustomJWTAuthentication]
    permission_classes = [IsCustomerOrEmployee]

    def get(self, request):
        if isinstance(request.user, Customer):
            # Customer sees only appointments for their vehicles
            vehicle_ids = request.user.vehicles.values_list('vehicle_id', flat=True)
            qs = Appointment.objects.filter(vehicle_id__in=vehicle_ids)
        else:
            # Employee sees all
            qs = Appointment.objects.all()
        serializer = AppointmentReadSerializer(qs, many=True)
        return Response(serializer.data)

    def post(self, request):
        data = request.data.copy()

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
#  Admin-only list views
# ══════════════════════════════════════════════════════════════════

class AdminCustomerListView(APIView):
    """GET /api/admin/customers/"""
    authentication_classes = [CustomJWTAuthentication]
    permission_classes = [IsEmployee]

    def get(self, request):
        qs = Customer.objects.all().order_by('-created_at')
        serializer = CustomerProfileSerializer(qs, many=True)
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


# ══════════════════════════════════════════════════════════════════
#  Contact form (no model — just validates and logs for now)
# ══════════════════════════════════════════════════════════════════

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


# ══════════════════════════════════════════════════════════════════
#  Existing endpoints (kept as-is)
# ══════════════════════════════════════════════════════════════════

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
