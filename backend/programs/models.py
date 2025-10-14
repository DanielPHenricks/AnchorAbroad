from django.db import models

class Program(models.Model):
    name = models.CharField(max_length=255, unique=True) # Primary key
    description = models.TextField()
    latitude = models.FloatField()
    longitude = models.FloatField()
