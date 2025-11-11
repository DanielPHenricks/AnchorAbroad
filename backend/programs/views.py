# Names: Daniel, Jacob, Maharshi, Ben
# Total time: 15 mins 

from django.http import JsonResponse
from django.shortcuts import render
from .models import Program
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from .serializers import ProgramSerializer

@api_view(['GET'])
@permission_classes([AllowAny])
def list_programs(request): # List all the programs.
    programs = Program.objects.all()
    serializer = ProgramSerializer(programs, many=True)
    print("Program view")
    return JsonResponse(serializer.data, safe=False)