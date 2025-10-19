from django.contrib import admin
from django.urls import path
from django.http import JsonResponse
from core import views

def home(request):
    return JsonResponse({"message": "Welcome to the Places API!"})

urlpatterns = [
    path("admin/", admin.site.urls),
    path("", home, name="home"),
    path("api/places/reviews", views.place_reviews, name="place_reviews"),
]