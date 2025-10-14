from django.urls import path
from . import views

urlpatterns = [
    path('', views.list_programs, name='program_list'),
]