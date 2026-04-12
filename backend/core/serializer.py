from rest_framework import serializers
from django.contrib.auth.hashers import make_password, check_password
from .models import Customer, Vehicle, Employee, Appointment, SiteService, BusinessInformation, ServiceRecommendation, Invoice
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer


# ── legacy (tutorial) ──────────────────────────────────────────────
# ReactSerializer removed — React model is unused
# ───────────────────────────────────────────────────────────────────


# ══════════════════════════════════════════════════════════════════
#  Customer serializers
# ══════════════════════════════════════════════════════════════════

class CustomerRegistrationSerializer(serializers.ModelSerializer):
    """Used by POST /api/customers/register/"""
    password = serializers.CharField(write_only=True, min_length=8, max_length=24)

    class Meta:
        model = Customer
        fields = [
            'customer_id', 'first_name', 'last_name',
            'email', 'phone', 'password',
        ]
        read_only_fields = ['customer_id']

    def create(self, validated_data):
        validated_data['password_hash'] = make_password(validated_data.pop('password'))
        return super().create(validated_data)


class CustomerProfileSerializer(serializers.ModelSerializer):
    """Used by GET/PUT /api/customers/me/"""
    password = serializers.CharField(
        write_only=True, required=False,
        min_length=8, max_length=24,
    )

    class Meta:
        model = Customer
        fields = [
            'customer_id', 'first_name', 'last_name',
            'email', 'phone', 'created_at', 'password',
        ]
        read_only_fields = ['customer_id', 'created_at']

    def update(self, instance, validated_data):
        if 'password' in validated_data:
            instance.password_hash = make_password(validated_data.pop('password'))
        return super().update(instance, validated_data)


# ══════════════════════════════════════════════════════════════════
#  Vehicle serializers
# ══════════════════════════════════════════════════════════════════

class VehicleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vehicle
        fields = [
            'vehicle_id', 'customer', 'make', 'model',
            'year', 'license_plate',
        ]
        read_only_fields = ['vehicle_id']


# ══════════════════════════════════════════════════════════════════
#  Employee serializers
# ══════════════════════════════════════════════════════════════════


class EmployeeProfileSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False, min_length=8, max_length=24)

    class Meta:
        model = Employee
        fields = [
            'employee_id', 'first_name', 'last_name',
            'email', 'phone', 'role', 'password',
        ]
        read_only_fields = ['employee_id', 'role']

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        if password:
            validated_data['password_hash'] = make_password(password)
        return super().create(validated_data)

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        if password:
            instance.password_hash = make_password(password)
        return super().update(instance, validated_data)

class EmployeeRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8, max_length=24)

    class Meta:
        model = Employee
        fields = [
            'employee_id', 'first_name', 'last_name',
            'email', 'phone', 'role', 'password',
        ]
        read_only_fields = ['employee_id']

    def create(self, validated_data):
        validated_data['password_hash'] = make_password(validated_data.pop('password'))
        return super().create(validated_data)


# ══════════════════════════════════════════════════════════════════
#  Appointment serializers
# ══════════════════════════════════════════════════════════════════

class AppointmentSerializer(serializers.ModelSerializer):
    """Flat IDs — used for create / update."""
    def validate(self, data):
        """Ensure we don't create duplicate appointments for the same vehicle at the same time."""
        scheduled_at = data.get('scheduled_at')
        if scheduled_at:
            qs = Appointment.objects.filter(scheduled_at=scheduled_at)
            # If updating, exclude the instance being updated
            if self.instance:
                qs = qs.exclude(pk=self.instance.pk)
            if qs.exists():
                raise serializers.ValidationError({'scheduled_at': 'An appointment already exists at the specified date/time.'})
        return data
    class Meta:
        model = Appointment
        fields = [
            'appointment_id', 'vehicle', 'employee',
            'service_type', 'cost',
            'scheduled_at', 'started_at', 'finished_at',
            'created_at',
        ]
        read_only_fields = ['appointment_id', 'created_at']


class AppointmentReadSerializer(serializers.ModelSerializer):
    """Nested objects — used for list / retrieve."""
    vehicle = VehicleSerializer(read_only=True)
    employee = EmployeeProfileSerializer(read_only=True)
    customer_name = serializers.SerializerMethodField()

    class Meta:
        model = Appointment
        fields = [
            'appointment_id', 'vehicle', 'employee',
            'customer_name', 'service_type', 'cost',
            'scheduled_at', 'started_at', 'finished_at',
            'created_at',
        ]

    def get_customer_name(self, obj):
        c = obj.vehicle.customer
        return f'{c.first_name} {c.last_name}'


# ══════════════════════════════════════════════════════════════════
#  Admin / staff JWT (Django auth_user — used by /admin/login)
# ══════════════════════════════════════════════════════════════════

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        data['user'] = {
            'id': self.user.id,
            'username': self.user.username,
            'email': self.user.email,
        }
        return data


class SiteServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteService
        fields = [
            'service_id', 'name', 'description',
            'cost', 'image', 'display_order', 'is_active',
        ]


# ══════════════════════════════════════════════════════════════════
#  Invoice serializers
# ══════════════════════════════════════════════════════════════════

class InvoiceSerializer(serializers.ModelSerializer):
    """Flat IDs — used for create / update."""
    class Meta:
        model = Invoice
        fields = [
            'invoice_id',
            'appointment',
            'status',
            'created_at',
        ]
        read_only_fields = ['invoice_id', 'created_at']


class InvoiceReadSerializer(serializers.ModelSerializer):
    appointment = AppointmentReadSerializer(read_only=True)
    customer = serializers.SerializerMethodField()
    vehicle = serializers.SerializerMethodField()
    date = serializers.SerializerMethodField()
    services = serializers.SerializerMethodField()
    cost = serializers.SerializerMethodField()

    class Meta:
        model = Invoice
        fields = [
            'invoice_id',
            'appointment',
            'customer',
            'vehicle',
            'date',
            'services',
            'cost',
            'status',
            'created_at',
        ]

    def get_customer(self, obj):
        c = obj.appointment.vehicle.customer
        return f'{c.first_name} {c.last_name}'

    def get_vehicle(self, obj):
        v = obj.appointment.vehicle
        return f'{v.make} {v.model}'

    def get_date(self, obj):
        return obj.appointment.scheduled_at
    
    def get_services(self, obj):
        return obj.appointment.service_type
    
    def get_cost(self, obj):
        return obj.appointment.cost

# ══════════════════════════════════════════════════════════════════
#  Business Information serializers
# ══════════════════════════════════════════════════════════════════

class BusinessInformationSerializer(serializers.ModelSerializer):
    class Meta:
        model = BusinessInformation
        fields = [
            'info_id', 'name', 'address', 'phone', 'email', 'hours'
        ]
        read_only_fields = ['info_id']


# ══════════════════════════════════════════════════════════════════
#  Service Recommendation serializers
# ══════════════════════════════════════════════════════════════════

class ServiceRecommendationSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceRecommendation
        fields = [
            'recommendation_id', 'customer', 'vehicle', 'service',
            'recommended_by', 'note', 'status', 'created_at',
        ]
        read_only_fields = ['recommendation_id', 'created_at']


class ServiceRecommendationReadSerializer(serializers.ModelSerializer):
    service_name = serializers.CharField(source='service.name', read_only=True)
    vehicle_display = serializers.SerializerMethodField()

    class Meta:
        model = ServiceRecommendation
        fields = [
            'recommendation_id', 'customer', 'vehicle', 'service',
            'service_name', 'vehicle_display', 'recommended_by',
            'note', 'status', 'created_at',
        ]

    def get_vehicle_display(self, obj):
        v = obj.vehicle
        return f'{v.year} {v.make} {v.model}'


# ══════════════════════════════════════════════════════════════════
#  Admin Customer Detail serializer (nested vehicles + appointments)
# ══════════════════════════════════════════════════════════════════

class AdminCustomerDetailSerializer(serializers.ModelSerializer):
    vehicles = VehicleSerializer(many=True, read_only=True)
    appointments = serializers.SerializerMethodField()

    class Meta:
        model = Customer
        fields = [
            'customer_id', 'first_name', 'last_name',
            'email', 'phone', 'created_at',
            'vehicles', 'appointments',
        ]
        read_only_fields = ['customer_id', 'created_at']

    def get_appointments(self, obj):
        vehicle_ids = obj.vehicles.values_list('vehicle_id', flat=True)
        appointments = Appointment.objects.filter(
            vehicle_id__in=vehicle_ids
        ).select_related('vehicle', 'employee').order_by('-scheduled_at')
        return AppointmentReadSerializer(appointments, many=True).data