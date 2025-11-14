from django.contrib import admin
from django.urls import path
from django.http import JsonResponse
from core import views
from rest_framework_simplejwt.views import TokenRefreshView
from core.views import CustomTokenObtainPairView



def home(request):

    return JsonResponse({"message": "Welcome the Places API!"})

urlpatterns = [
    path("admin/", admin.site.urls),
    path("", home, name="home"),
    path("api/places/reviews", views.place_reviews, name="place_reviews"),
    path('api/token', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]