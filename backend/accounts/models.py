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