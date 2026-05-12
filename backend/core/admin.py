from django.contrib import admin
from .models import Customer, Vehicle, Employee, Appointment, SiteService, ServiceRecommendation


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


@admin.register(SiteService)
class SiteServiceAdmin(admin.ModelAdmin):
    list_display = ('service_id', 'name', 'cost', 'display_order', 'is_active')
    search_fields = ('name',)
    list_filter = ('is_active',)
    list_editable = ('display_order', 'is_active')


@admin.register(ServiceRecommendation)
class ServiceRecommendationAdmin(admin.ModelAdmin):
    list_display = ('recommendation_id', 'customer', 'vehicle', 'service', 'recommended_by', 'status', 'created_at')
    search_fields = ('customer__first_name', 'customer__last_name', 'service__name')
    list_filter = ('status', 'created_at')
    raw_id_fields = ('customer', 'vehicle', 'service', 'recommended_by')
