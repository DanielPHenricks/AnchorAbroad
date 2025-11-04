from django.db import models
from django.contrib.auth.models import User
from programs.models import Program


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
    year = models.CharField(max_length=20, blank=True)
    major = models.CharField(max_length=100, blank=True)
    study_abroad_term = models.CharField(max_length=50, blank=True)
    profile_picture = models.ImageField(upload_to='profile_pictures/', blank=True, null=True)

    def __str__(self):
        return f"{self.user.username} Profile"