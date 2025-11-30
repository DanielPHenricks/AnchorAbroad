# Names: Daniel, Jacob, Maharshi, Ben
# Total time: 15 mins 

from django.http import JsonResponse
from django.shortcuts import render
from .models import Program
from accounts.models import Alumni
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from accounts.permissions import IsAuthenticatedOrAlumni
from .serializers import ProgramSerializer, ReviewSerializer
from rest_framework.response import Response
from rest_framework import status

@api_view(['GET'])
@permission_classes([AllowAny])
def list_programs(request): # List all the programs.
    programs = Program.objects.all()
    serializer = ProgramSerializer(programs, many=True)
    print("Program view")
    return JsonResponse(serializer.data, safe=False)


@api_view(['POST'])
@permission_classes([IsAuthenticatedOrAlumni])
def add_review(request, program_id):
    """
    Add a review for a program.
    Only allows Alumni to post reviews.
    """
    # Check if user is an alumni
    alumni_id = request.session.get('alumni_id')
    if not alumni_id:
        return Response({'error': 'Only alumni can submit reviews'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        program = Program.objects.get(program_id=program_id)
        alumni = Alumni.objects.get(id=alumni_id)
    except (Program.DoesNotExist, Alumni.DoesNotExist):
        return Response({'error': 'Program or Alumni not found'}, status=status.HTTP_404_NOT_FOUND)

    # Check if alumni already reviewed this program (optional, but good practice)
    # if Review.objects.filter(program=program, alumni=alumni).exists():
    #     return Response({'error': 'You have already reviewed this program'}, status=status.HTTP_400_BAD_REQUEST)

    data = request.data.copy()
    data['program'] = program.program_id
    # We don't need to pass alumni in data as we set it manually or via serializer context if needed, 
    # but ReviewSerializer expects 'alumni' field.
    # Let's create the review manually or use serializer with partial data.
    
    # Better approach: Use serializer
    serializer = ReviewSerializer(data=data)
    if serializer.is_valid():
        serializer.save(program=program, alumni=alumni)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)