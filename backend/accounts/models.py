from django.db import models
from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password, check_password
from programs.models import Program


class Alumni(models.Model):
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=128)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    program = models.ForeignKey(Program, on_delete=models.CASCADE, related_name='alumni')
    graduation_year = models.IntegerField()
    study_abroad_term = models.CharField(max_length=100, blank=True)
    bio = models.TextField(blank=True)
    profile_picture = models.ImageField(upload_to='alumni_pictures/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name_plural = "Alumni"
        ordering = ['-graduation_year']

    def __str__(self):
        return f"{self.first_name} {self.last_name} - {self.program.name}"

    def set_password(self, raw_password):
        """Hash and set password"""
        self.password = make_password(raw_password)

    def check_password(self, raw_password):
        """Check if provided password matches stored hash"""
        return check_password(raw_password, self.password)


class Favorite(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='favorites')
    program = models.ForeignKey(Program, on_delete=models.CASCADE, related_name='favorited_by')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('user', 'program')
    
    def __str__(self):
        return f"{self.user.username} - {self.program.name}"
    
class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    year = models.CharField(max_length=10, blank=True)
    major = models.CharField(max_length=100, blank=True)
    study_abroad_term = models.CharField(max_length=100, blank=True)
    profile_picture = models.ImageField(upload_to='profile_pictures/', blank=True, null=True)

    def __str__(self):
        return f"{self.user.username} Profile"