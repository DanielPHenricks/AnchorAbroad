from django.http import JsonResponse
from django.shortcuts import render
from .models import Program
from rest_framework.decorators import api_view
from .serializers import ProgramSerializer

@api_view(['GET'])
def list_programs(request): # List all the programs.
    programs = Program.objects.all()
    serializer = ProgramSerializer(programs, many=True)
    return JsonResponse(serializer.data)

