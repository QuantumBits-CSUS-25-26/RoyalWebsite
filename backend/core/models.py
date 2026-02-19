from django.db import models



class Customer(models.Model):
    customer_id = models.AutoField(primary_key=True)
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    phone = models.CharField(max_length=20, blank=True, default='')
    email = models.EmailField(unique=True)
    password_hash = models.CharField(max_length=128)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'customer'

    def __str__(self):
        return f'{self.first_name} {self.last_name} ({self.email})'


class Vehicle(models.Model):
    vehicle_id = models.AutoField(primary_key=True)
    customer = models.ForeignKey(
        Customer,
        on_delete=models.CASCADE,
        related_name='vehicles',
    )
    make = models.CharField(max_length=50)
    model = models.CharField(max_length=50)
    year = models.PositiveSmallIntegerField()
    license_plate = models.CharField(max_length=15, unique=True)

    class Meta:
        db_table = 'vehicle'

    def __str__(self):
        return f'{self.year} {self.make} {self.model} ({self.license_plate})'


class Employee(models.Model):
    ROLE_CHOICES = [
        ('employee', 'Employee'),
        ('admin', 'Admin'),
    ]

    employee_id = models.AutoField(primary_key=True)
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    phone = models.CharField(max_length=20, blank=True, default='')
    email = models.EmailField(unique=True)
    password_hash = models.CharField(max_length=128)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='employee')

    class Meta:
        db_table = 'employee'

    def __str__(self):
        return f'{self.first_name} {self.last_name} ({self.role})'


class Appointment(models.Model):
    """
    A scheduled service appointment for a vehicle.
    Can be created by either the customer (who owns the vehicle)
    or an employee on behalf of the customer.
    """
    appointment_id = models.AutoField(primary_key=True)
    vehicle = models.ForeignKey(
        Vehicle,
        on_delete=models.CASCADE,
        related_name='appointments',
    )
    employee = models.ForeignKey(
        Employee,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='appointments',
    )
    service_type = models.CharField(max_length=100)
    cost = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    scheduled_at = models.DateTimeField()
    started_at = models.DateTimeField(null=True, blank=True)
    finished_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'appointment'
        ordering = ['-scheduled_at']

    def __str__(self):
        return f'{self.service_type} – {self.vehicle} @ {self.scheduled_at}'
