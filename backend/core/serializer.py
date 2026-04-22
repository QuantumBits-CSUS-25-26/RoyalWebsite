from rest_framework import serializers
from django.contrib.auth.hashers import make_password, check_password
from .models import Customer, Vehicle, Employee, Appointment, AppointmentLineItem, SiteService, BusinessInformation, ServiceRecommendation, Invoice, InvoiceLineItem, Messsage
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
#  Message serializers
# ══════════════════════════════════════════════════════════════════
class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Messsage
        fields = [
            'message_id', 'first_name', 'last_name', 'phone_number',
            'email', 'message', 'response', 'current_customer', 'read',
            'created_at',
        ]
        read_only_fields = ['message_id', 'created_at']

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

class AppointmentLineItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = AppointmentLineItem
        fields = ['line_id', 'name', 'cost']
        read_only_fields = ['line_id']


class AppointmentSerializer(serializers.ModelSerializer):
    """Flat IDs — used for create / update. Accepts nested `lines`."""
    lines = AppointmentLineItemSerializer(many=True, required=False)

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
            'lines', 'created_at',
        ]
        read_only_fields = ['appointment_id', 'created_at']

    def create(self, validated_data):
        lines_data = validated_data.pop('lines', None)
        instance = super().create(validated_data)
        if lines_data:
            for ld in lines_data:
                AppointmentLineItem.objects.create(appointment=instance, **ld)
            names = [ld.get('name', '') for ld in lines_data if ld.get('name')]
            if names and not instance.service_type:
                instance.service_type = ', '.join(names)
            total = sum((ld.get('cost') or 0) for ld in lines_data)
            if total and not instance.cost:
                instance.cost = total
            instance.save(update_fields=['service_type', 'cost'])
        return instance

    def update(self, instance, validated_data):
        lines_data = validated_data.pop('lines', None)
        instance = super().update(instance, validated_data)
        if lines_data is not None:
            instance.lines.all().delete()
            for ld in lines_data:
                AppointmentLineItem.objects.create(appointment=instance, **ld)
        return instance


class AppointmentReadSerializer(serializers.ModelSerializer):
    """Nested objects — used for list / retrieve."""
    vehicle = VehicleSerializer(read_only=True)
    employee = EmployeeProfileSerializer(read_only=True)
    customer_name = serializers.SerializerMethodField()
    lines = AppointmentLineItemSerializer(many=True, read_only=True)

    class Meta:
        model = Appointment
        fields = [
            'appointment_id', 'vehicle', 'employee',
            'customer_name', 'service_type', 'cost',
            'scheduled_at', 'started_at', 'finished_at',
            'lines', 'created_at',
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

class InvoiceLineItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = InvoiceLineItem
        fields = ['line_id', 'name', 'cost']
        read_only_fields = ['line_id']


class InvoiceSerializer(serializers.ModelSerializer):
    """Flat IDs — used for create / update. Accepts nested `lines`."""
    lines = InvoiceLineItemSerializer(many=True, required=False)

    class Meta:
        model = Invoice
        fields = [
            'invoice_id',
            'appointment',
            'status',
            'due_date',
            'notes',
            'lines',
            'created_at',
        ]
        read_only_fields = ['invoice_id', 'created_at']

    def create(self, validated_data):
        lines_data = validated_data.pop('lines', None)
        instance = super().create(validated_data)
        if lines_data is None:
            appt = instance.appointment
            # Prefer the appointment's own line items (multi-service appts).
            appt_lines = list(appt.lines.all())
            if appt_lines:
                for al in appt_lines:
                    InvoiceLineItem.objects.create(invoice=instance, name=al.name, cost=al.cost or 0)
            else:
                # Fallback: split service_type on commas and look up catalog prices.
                names = [n.strip() for n in (appt.service_type or '').split(',') if n.strip()]
                if names:
                    for nm in names:
                        svc = SiteService.objects.filter(name__iexact=nm).first()
                        cost = svc.cost if (svc and svc.cost is not None) else 0
                        InvoiceLineItem.objects.create(invoice=instance, name=(svc.name if svc else nm), cost=cost)
                    total = sum((ln.cost or 0) for ln in instance.lines.all())
                    if total == 0 and appt.cost and instance.lines.count() == 1:
                        ln = instance.lines.first()
                        ln.cost = appt.cost
                        ln.save(update_fields=['cost'])
                else:
                    InvoiceLineItem.objects.create(
                        invoice=instance,
                        name='Service',
                        cost=appt.cost or 0,
                )
        else:
            for ld in lines_data:
                InvoiceLineItem.objects.create(invoice=instance, **ld)
        return instance

    def update(self, instance, validated_data):
        lines_data = validated_data.pop('lines', None)
        instance = super().update(instance, validated_data)
        if lines_data is not None:
            instance.lines.all().delete()
            for ld in lines_data:
                InvoiceLineItem.objects.create(invoice=instance, **ld)
        return instance


class InvoiceReadSerializer(serializers.ModelSerializer):
    appointment = AppointmentReadSerializer(read_only=True)
    customer = serializers.SerializerMethodField()
    vehicle = serializers.SerializerMethodField()
    date = serializers.SerializerMethodField()
    lines = InvoiceLineItemSerializer(many=True, read_only=True)
    amount = serializers.SerializerMethodField()

    class Meta:
        model = Invoice
        fields = [
            'invoice_id',
            'appointment',
            'customer',
            'vehicle',
            'date',
            'lines',
            'amount',
            'status',
            'due_date',
            'notes',
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

    def get_amount(self, obj):
        total = sum((ln.cost or 0) for ln in obj.lines.all())
        if total:
            return total
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
        ).select_related('vehicle', 'vehicle__customer', 'employee').prefetch_related('lines').order_by('-scheduled_at')
        return AppointmentReadSerializer(appointments, many=True).data