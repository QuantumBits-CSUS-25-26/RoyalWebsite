from django.contrib import admin
from .models import Customer, Vehicle, Employee, Appointment


@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ('customer_id', 'first_name', 'last_name', 'email', 'phone', 'created_at')
    search_fields = ('first_name', 'last_name', 'email')


@admin.register(Vehicle)
class VehicleAdmin(admin.ModelAdmin):
    list_display = ('vehicle_id', 'customer', 'year', 'make', 'model', 'license_plate')
    search_fields = ('license_plate', 'make', 'model')
    list_filter = ('make',)


@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = ('employee_id', 'first_name', 'last_name', 'email', 'role')
    search_fields = ('first_name', 'last_name', 'email')
    list_filter = ('role',)


@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ('appointment_id', 'vehicle', 'employee', 'service_type', 'cost', 'scheduled_at', 'started_at', 'finished_at')
    search_fields = ('service_type',)
    list_filter = ('service_type', 'scheduled_at')
    raw_id_fields = ('vehicle', 'employee')
