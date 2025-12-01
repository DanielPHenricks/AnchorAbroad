# Names: Daniel, Jacob, Maharshi, Ben
# Total time: 1 hour

from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from .models import Favorite, Profile, Alumni
from programs.serializers import ProgramSerializer


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration"""
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'password_confirm', 'first_name', 'last_name')

    def validate(self, attrs):
        """Validate password confirmation"""
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Passwords don't match")
        return attrs

    def create(self, validated_data):
        """Create a new user"""
        validated_data.pop('password_confirm')
        user = User.objects.create_user(**validated_data)
        return user


class UserLoginSerializer(serializers.Serializer):
    """Serializer for user login"""
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        """Validate user credentials"""
        username = attrs.get('username')
        password = attrs.get('password')

        if username and password:
            user = authenticate(username=username, password=password)
            if not user:
                raise serializers.ValidationError('Invalid credentials')
            if not user.is_active:
                raise serializers.ValidationError('User account is disabled')
            attrs['user'] = user
        else:
            raise serializers.ValidationError('Must include username and password')
        
        return attrs


class UserSerializer(serializers.ModelSerializer):
    """Serializer for user data"""
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name')
        read_only_fields = ('id',)


class FavoriteSerializer(serializers.ModelSerializer):
    """Serializer for favorites"""
    program = ProgramSerializer(read_only=True)
    program_id = serializers.CharField(write_only=True)
    
    class Meta:
        model = Favorite
        fields = ('id', 'program', 'program_id', 'created_at')
        read_only_fields = ('id', 'created_at')
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ('user', 'year', 'major', 'study_abroad_term')


class AlumniRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for alumni registration"""
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)
    program_id = serializers.CharField(write_only=True)

    class Meta:
        model = Alumni
        fields = ('email', 'password', 'password_confirm', 'first_name', 'last_name',
                  'program_id', 'graduation_year', 'study_abroad_term', 'bio')

    def validate(self, attrs):
        """Validate password confirmation"""
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Passwords don't match")
        return attrs

    def create(self, validated_data):
        """Create a new alumni user"""
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')

        alumni = Alumni(**validated_data)
        alumni.set_password(password)
        alumni.save()
        return alumni


class AlumniLoginSerializer(serializers.Serializer):
    """Serializer for alumni login"""
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        """Validate alumni credentials"""
        email = attrs.get('email')
        password = attrs.get('password')

        if email and password:
            try:
                alumni = Alumni.objects.get(email=email)
                if not alumni.check_password(password):
                    raise serializers.ValidationError('Invalid credentials')
                if not alumni.is_active:
                    raise serializers.ValidationError('Alumni account is disabled')
                attrs['alumni'] = alumni
            except Alumni.DoesNotExist:
                raise serializers.ValidationError('Invalid credentials')
        else:
            raise serializers.ValidationError('Must include email and password')

        return attrs


class AlumniSerializer(serializers.ModelSerializer):
    """Serializer for alumni data"""
    program = ProgramSerializer(read_only=True)

    class Meta:
        model = Alumni
        fields = ('id', 'email', 'first_name', 'last_name', 'program', 'graduation_year',
                  'study_abroad_term', 'bio', 'created_at')
        read_only_fields = ('id', 'created_at')