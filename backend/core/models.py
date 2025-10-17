from django.db import models

# Create your models here.

#test model (from tutorial)
class React(models.Model):
    name = models.CharField(max_length=30)
    detail = models.CharField(max_length=500)
