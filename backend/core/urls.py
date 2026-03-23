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
    path('admin/employees/create/', views.AdminEmployeeCreateView.as_view(), name='admin_employee_create'),
    path('admin/employees/<int:employee_id>/delete/', views.AdminEmployeeDeleteView.as_view(), name='admin_employee_delete'),
    path('admin/employees/<int:employee_id>/edit/', views.AdminEmployeeEditView.as_view(), name='admin_employee_edit'),
    
    # ── Vehicles (customer-scoped) ─────────────────────────────
    path('vehicles/', views.VehicleListCreateView.as_view(), name='vehicle_list_create'),
    path('vehicles/<int:vehicle_id>/', views.VehicleDetailView.as_view(), name='vehicle_detail'),

    # ── Appointments ───────────────────────────────────────────
    path('appointments/', views.AppointmentListCreateView.as_view(), name='appointment_list_create'),
    path('appointments/<int:appointment_id>/', views.AppointmentDetailView.as_view(), name='appointment_detail'),

    # ── Contact form ───────────────────────────────────────────
    path('contact/', views.ContactMessageView.as_view(), name='contact_message'),

    path('services/', views.SiteServiceListCreateView.as_view(), name='site_service_list_create'),
    path('services/<int:service_id>/', views.SiteServiceDetailView.as_view(), name='site_service_detail'),

    path('admin/customers/', views.AdminCustomerListView.as_view(), name='admin_customer_list'),
    path('admin/appointments/', views.AdminAppointmentListView.as_view(), name='admin_appointment_list'),
    path('admin/vehicles/', views.AdminVehicleListView.as_view(), name='admin_vehicle_list'),
    path('admin/employees/', views.AdminEmployeeListView.as_view(), name='admin_employee_list'),

    # ── Business Information ───────────────────────────────────
    path('business-info/', views.BusinessInformationView.as_view(), name='business_info'),
    path('business-info/<int:info_id>/', views.BusinessInformationDetailView.as_view(), name='business_info_detail'),


    # ── Facebook Posts ───────────────────────────────────────────
    path('facebook-posts/', views.FacebookPostsView.as_view(), name='facebook_posts'),

    # ── Admin Dashboard ───────────────────────────────────
    path('admin/dashboard-totals/', views.AdminDashboardTotalsView.as_view(), name='admin_dashboard_totals'),
    path('admin/recent-customers/', views.AdminRecentCustomersView.as_view(), name='admin_recent_customers'),
]
