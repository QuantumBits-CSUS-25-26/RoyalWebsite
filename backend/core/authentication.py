from rest_framework import authentication, exceptions
from rest_framework_simplejwt.tokens import RefreshToken, AccessToken
from rest_framework_simplejwt.exceptions import TokenError
from .models import Customer, Employee


def get_tokens_for_customer(customer):
    refresh = RefreshToken()
    refresh['user_type'] = 'customer'
    refresh['user_id'] = customer.customer_id
    refresh['email'] = customer.email
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }


def get_tokens_for_employee(employee):
    refresh = RefreshToken()
    refresh['user_type'] = 'employee'
    refresh['user_id'] = employee.employee_id
    refresh['email'] = employee.email
    refresh['role'] = employee.role
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }


class CustomJWTAuthentication(authentication.BaseAuthentication):

    def authenticate(self, request):
        auth_header = request.headers.get('Authorization', '')
        if not auth_header.startswith('Bearer '):
            return None

        raw_token = auth_header.split(' ', 1)[1]

        try:
            validated = AccessToken(raw_token)
        except TokenError as e:
            raise exceptions.AuthenticationFailed(f'Invalid token: {e}')

        user_type = validated.get('user_type')
        user_id = validated.get('user_id')

        if not user_type or not user_id:
            raise exceptions.AuthenticationFailed('Token missing user claims.')

        if user_type == 'customer':
            try:
                user = Customer.objects.get(customer_id=user_id)
            except Customer.DoesNotExist:
                raise exceptions.AuthenticationFailed('Customer not found.')
        elif user_type == 'employee':
            try:
                user = Employee.objects.get(employee_id=user_id)
            except Employee.DoesNotExist:
                raise exceptions.AuthenticationFailed('Employee not found.')
        else:
            raise exceptions.AuthenticationFailed('Unknown user type.')

        user.token_payload = dict(validated.payload)
        return (user, validated.payload)
