from django.urls import path
from . import views

urlpatterns = [
    # ── Customer auth ──────────────────────────────────────────
    path('customers/register/', views.CustomerRegisterView.as_view(), name='customer_register'),
    path('customers/login/', views.CustomerLoginView.as_view(), name='customer_login'),
    path('customers/me/', views.CustomerProfileView.as_view(), name='customer_profile'),

    # ── Employee / Staff auth ──────────────────────────────────
    path('employees/login/', views.EmployeeLoginView.as_view(), name='employee_login'),
    path('login/', views.EmployeeLoginView.as_view(), name='staff_login'),  # alias for Login.js

    # ── Vehicles (customer-scoped) ─────────────────────────────
    path('vehicles/', views.VehicleListCreateView.as_view(), name='vehicle_list_create'),
    path('vehicles/<int:vehicle_id>/', views.VehicleDetailView.as_view(), name='vehicle_detail'),

    # ── Appointments ───────────────────────────────────────────
    path('appointments/', views.AppointmentListCreateView.as_view(), name='appointment_list_create'),
    path('appointments/<int:appointment_id>/', views.AppointmentDetailView.as_view(), name='appointment_detail'),

    # ── Contact form ───────────────────────────────────────────
    path('contact/', views.ContactMessageView.as_view(), name='contact_message'),

    # ── Admin / employee list views ────────────────────────────
    path('admin/customers/', views.AdminCustomerListView.as_view(), name='admin_customer_list'),
    path('admin/appointments/', views.AdminAppointmentListView.as_view(), name='admin_appointment_list'),
    path('admin/vehicles/', views.AdminVehicleListView.as_view(), name='admin_vehicle_list'),
]
