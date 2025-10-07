from django.db import models
from django.contrib.auth.models import AbstractUser

class Student(AbstractUser):
    graduation_year = models.IntegerField(null=True, blank=True)
    primary_major = models.CharField(max_length=255, null=True, blank=True)
    
    def __str__(self):
        return self.username