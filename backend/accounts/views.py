# Names: Daniel, Jacob, Maharshi, Ben
# Total time: 45 mins 

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.decorators import parser_classes
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.contrib.auth import login, logout
from django.contrib.auth.models import User
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.shortcuts import get_object_or_404
from .serializers import (
    UserRegistrationSerializer, UserLoginSerializer, UserSerializer,
    FavoriteSerializer, ProfileSerializer,
    AlumniRegistrationSerializer, AlumniLoginSerializer, AlumniSerializer
)
from .models import Favorite, Profile, Alumni
from .permissions import IsAuthenticatedOrAlumni
from programs.models import Program


@api_view(['POST'])
@permission_classes([AllowAny])
def signup_view(request):
    """Handle user registration"""
    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        login(request, user)
        user_data = UserSerializer(user).data
        return Response({
            'message': 'User created successfully',
            'user': user_data
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """Handle user login"""
    serializer = UserLoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data['user']
        login(request, user)
        user_data = UserSerializer(user).data
        return Response({
            'message': 'Login successful',
            'user': user_data
        }, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def logout_view(request):
    """Handle user logout"""
    logout(request)
    return Response({'message': 'Logout successful'}, status=status.HTTP_200_OK)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticatedOrAlumni])
def favorites_view(request):
    """Handle user favorites"""
    if request.method == 'GET':
        favorites = Favorite.objects.filter(user=request.user)
        serializer = FavoriteSerializer(favorites, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    elif request.method == 'POST':
        serializer = FavoriteSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            try:
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            except Exception as e:
                return Response({'error': 'Program already favorited'}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@permission_classes([IsAuthenticatedOrAlumni])
def remove_favorite_view(request, program_id):
    """Remove a program from favorites"""
    try:
        favorite = Favorite.objects.get(user=request.user, program_id=program_id)
        favorite.delete()
        return Response({'message': 'Favorite removed'}, status=status.HTTP_200_OK)
    except Favorite.DoesNotExist:
        return Response({'error': 'Favorite not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([IsAuthenticatedOrAlumni])
def check_favorite_view(request, program_id):
    """Check if a program is favorited by the user"""
    is_favorite = Favorite.objects.filter(user=request.user, program_id=program_id).exists()
    return Response({'is_favorite': is_favorite}, status=status.HTTP_200_OK)

@api_view(['GET', 'PUT', 'PATCH'])
@permission_classes([IsAuthenticatedOrAlumni])
@parser_classes([MultiPartParser, FormParser, JSONParser])
def user_profile_view(request):
    """Get or update user profile - handles both students and alumni"""
    
    # Check if this is an alumni user
    alumni_id = request.session.get('alumni_id')
    if alumni_id:
        # Return alumni profile
        try:
            alumni = Alumni.objects.get(id=alumni_id)
            alumni_data = AlumniSerializer(alumni).data
            return Response({'alumni': alumni_data}, status=status.HTTP_200_OK)
        except Alumni.DoesNotExist:
            return Response({'error': 'Alumni not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Otherwise, handle as student user
    if not request.user.is_authenticated:
        return Response({'error': 'Not authenticated'}, status=status.HTTP_401_UNAUTHORIZED)
    
    user = request.user
    profile, _ = Profile.objects.get_or_create(user=user)

    if request.method == 'GET':
        data = {
            'user': {
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
            },
            'profile': ProfileSerializer(profile).data,
        }
        return Response(data)

    elif request.method == 'PATCH':
        serializer = ProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ============ ALUMNI ENDPOINTS ============

@api_view(['POST'])
@permission_classes([AllowAny])
def alumni_signup_view(request):
    """Handle alumni registration"""
    serializer = AlumniRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        alumni = serializer.save()
        # Store alumni ID in session
        request.session['alumni_id'] = alumni.id
        alumni_data = AlumniSerializer(alumni).data
        return Response({
            'message': 'Alumni account created successfully',
            'alumni': alumni_data
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def alumni_login_view(request):
    """Handle alumni login"""
    serializer = AlumniLoginSerializer(data=request.data)
    if serializer.is_valid():
        alumni = serializer.validated_data['alumni']
        # Store alumni ID in session
        request.session['alumni_id'] = alumni.id
        alumni_data = AlumniSerializer(alumni).data
        return Response({
            'message': 'Login successful',
            'alumni': alumni_data
        }, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def alumni_logout_view(request):
    """Handle alumni logout"""
    if 'alumni_id' in request.session:
        del request.session['alumni_id']
    return Response({'message': 'Logout successful'}, status=status.HTTP_200_OK)


@api_view(['GET'])
def alumni_profile_view(request):
    """Get current alumni profile"""
    alumni_id = request.session.get('alumni_id')
    if alumni_id:
        try:
            alumni = Alumni.objects.get(id=alumni_id)
            alumni_data = AlumniSerializer(alumni).data
            return Response({'alumni': alumni_data}, status=status.HTTP_200_OK)
        except Alumni.DoesNotExist:
            return Response({'error': 'Alumni not found'}, status=status.HTTP_404_NOT_FOUND)
    return Response({'error': 'Not authenticated'}, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['GET'])
@permission_classes([AllowAny])
def alumni_by_program_view(request, program_id):
    """Get all alumni for a specific program"""
    try:
        program = Program.objects.get(program_id=program_id)
        alumni = Alumni.objects.filter(program=program, is_active=True)
        serializer = AlumniSerializer(alumni, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Program.DoesNotExist:
        return Response({'error': 'Program not found'}, status=status.HTTP_404_NOT_FOUND)
