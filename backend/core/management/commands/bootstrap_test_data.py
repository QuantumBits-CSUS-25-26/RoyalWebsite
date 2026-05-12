from django.core.management.base import BaseCommand
from django.contrib.auth.hashers import make_password
from django.utils import timezone
from decimal import Decimal

from core.models import Employee, Customer, Vehicle, Appointment, SiteService
from core.authentication import get_tokens_for_employee, get_tokens_for_customer


class Command(BaseCommand):
    help = "Bootstrap a test employee, customer, vehicle, appointment and service"

    def add_arguments(self, parser):
        parser.add_argument("--employee-email", default="staff@example.com")
        parser.add_argument("--employee-password", default="password123")
        parser.add_argument("--customer-email", default="test@example.com")
        parser.add_argument("--customer-password", default="password123")

    def handle(self, *args, **options):
        emp_email = options["employee_email"]
        emp_pwd = options["employee_password"]
        cust_email = options["customer_email"]
        cust_pwd = options["customer_password"]

        # Employee
        emp_defaults = {
            "first_name": "Test",
            "last_name": "Staff",
            "phone": "555-0000",
            "password_hash": make_password(emp_pwd),
            "role": "admin",
        }
        employee, created = Employee.objects.get_or_create(email=emp_email, defaults=emp_defaults)
        if created:
            self.stdout.write(self.style.SUCCESS(f"Created employee: {employee.email}"))
        else:
            self.stdout.write(f"Employee exists: {employee.email}")

        try:
            emp_tokens = get_tokens_for_employee(employee)
            self.stdout.write(f"Employee access token: {emp_tokens.get('access')}")
        except Exception:
            self.stdout.write("Could not generate employee tokens (authentication helper error)")

        # Customer
        cust_defaults = {
            "first_name": "Test",
            "last_name": "Customer",
            "phone": "916-000-0000",
            "password_hash": make_password(cust_pwd),
        }
        customer, c_created = Customer.objects.get_or_create(email=cust_email, defaults=cust_defaults)
        if c_created:
            self.stdout.write(self.style.SUCCESS(f"Created customer: {customer.email}"))
        else:
            self.stdout.write(f"Customer exists: {customer.email}")

        try:
            cust_tokens = get_tokens_for_customer(customer)
            self.stdout.write(f"Customer access token: {cust_tokens.get('access')}")
        except Exception:
            self.stdout.write("Could not generate customer tokens (authentication helper error)")

        # Vehicle
        vehicle = None
        existing = Vehicle.objects.filter(customer=customer).first()
        if existing:
            vehicle = existing
            self.stdout.write(f"Using existing vehicle id: {vehicle.vehicle_id}")
        else:
            vehicle = Vehicle.objects.create(
                customer=customer,
                make="TestMake",
                model="TestModel",
                year=2020,
                license_plate="TEST123",
            )
            self.stdout.write(self.style.SUCCESS(f"Created vehicle id: {vehicle.vehicle_id}"))

        # SiteService (optional)
        service, s_created = SiteService.objects.get_or_create(name="Test Service", defaults={"cost": Decimal("100.00"), "description": "Auto-created test service"})
        if s_created:
            self.stdout.write(self.style.SUCCESS(f"Created site service: {service.name}"))
        else:
            self.stdout.write(f"Site service exists: {service.name}")

        # Appointment
        appt_exists = Appointment.objects.filter(vehicle=vehicle, service_type__icontains="Test Service").first()
        if appt_exists:
            self.stdout.write(f"Appointment exists: {appt_exists.appointment_id}")
        else:
            scheduled = timezone.now() + timezone.timedelta(days=3)
            appt = Appointment.objects.create(
                vehicle=vehicle,
                employee=employee,
                service_type="Test Service",
                cost=Decimal("100.00"),
                scheduled_at=scheduled,
            )
            self.stdout.write(self.style.SUCCESS(f"Created appointment id: {appt.appointment_id} at {scheduled.isoformat()}"))

        self.stdout.write(self.style.SUCCESS("Bootstrap complete."))
