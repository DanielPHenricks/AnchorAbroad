"""
Authentication Tests for Accounts App
Tests user registration, login, logout, and profile endpoints
"""
import pytest
from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient


@pytest.fixture
def api_client():
    """Fixture to provide API client"""
    return APIClient()


@pytest.fixture
def test_user():
    """Fixture to create a test user"""
    return User.objects.create_user(
        username='testuser',
        email='test@example.com',
        password='testpass123',
        first_name='Test',
        last_name='User'
    )


@pytest.mark.django_db
class TestSignup:
    """Test user registration"""

    def test_signup_success(self, api_client):
        """Test successful user registration"""
        url = reverse('signup')
        data = {
            'username': 'newuser',
            'email': 'new@example.com',
            'password': 'password123',
            'password_confirm': 'password123',
            'first_name': 'New',
            'last_name': 'User'
        }

        response = api_client.post(url, data, format='json')

        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['message'] == 'User created successfully'
        assert 'user' in response.data
        assert response.data['user']['username'] == 'newuser'
        assert response.data['user']['email'] == 'new@example.com'

        # Verify user was created in database
        assert User.objects.filter(username='newuser').exists()

    def test_signup_auto_login(self, api_client):
        """Test that signup automatically logs in the user"""
        url = reverse('signup')
        data = {
            'username': 'newuser',
            'email': 'new@example.com',
            'password': 'password123',
            'password_confirm': 'password123',
            'first_name': 'New',
            'last_name': 'User'
        }

        response = api_client.post(url, data, format='json')

        assert response.status_code == status.HTTP_201_CREATED

        # Check if user is logged in by accessing profile
        profile_url = reverse('user_profile')
        profile_response = api_client.get(profile_url)
        assert profile_response.status_code == status.HTTP_200_OK

    def test_signup_duplicate_username(self, api_client, test_user):
        """Test signup with existing username"""
        url = reverse('signup')
        data = {
            'username': 'testuser',  # Already exists
            'email': 'different@example.com',
            'password': 'password123',
            'password_confirm': 'password123',
            'first_name': 'Test',
            'last_name': 'User'
        }

        response = api_client.post(url, data, format='json')

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'username' in response.data

    def test_signup_password_mismatch(self, api_client):
        """Test signup with mismatched passwords"""
        url = reverse('signup')
        data = {
            'username': 'newuser',
            'email': 'new@example.com',
            'password': 'password123',
            'password_confirm': 'different123',
            'first_name': 'New',
            'last_name': 'User'
        }

        response = api_client.post(url, data, format='json')

        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_signup_missing_fields(self, api_client):
        """Test signup with missing required fields"""
        url = reverse('signup')
        data = {
            'username': 'newuser',
            # Missing other required fields
        }

        response = api_client.post(url, data, format='json')

        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_signup_invalid_email(self, api_client):
        """Test signup with invalid email format"""
        url = reverse('signup')
        data = {
            'username': 'newuser',
            'email': 'invalid-email',
            'password': 'password123',
            'password_confirm': 'password123',
            'first_name': 'New',
            'last_name': 'User'
        }

        response = api_client.post(url, data, format='json')

        assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
class TestLogin:
    """Test user login"""

    def test_login_success(self, api_client, test_user):
        """Test successful login"""
        url = reverse('login')
        data = {
            'username': 'testuser',
            'password': 'testpass123'
        }

        response = api_client.post(url, data, format='json')

        assert response.status_code == status.HTTP_200_OK
        assert response.data['message'] == 'Login successful'
        assert 'user' in response.data
        assert response.data['user']['username'] == 'testuser'

    def test_login_invalid_credentials(self, api_client, test_user):
        """Test login with wrong password"""
        url = reverse('login')
        data = {
            'username': 'testuser',
            'password': 'wrongpassword'
        }

        response = api_client.post(url, data, format='json')

        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_login_nonexistent_user(self, api_client):
        """Test login with non-existent username"""
        url = reverse('login')
        data = {
            'username': 'nonexistent',
            'password': 'password123'
        }

        response = api_client.post(url, data, format='json')

        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_login_missing_username(self, api_client):
        """Test login with missing username"""
        url = reverse('login')
        data = {
            'password': 'password123'
        }

        response = api_client.post(url, data, format='json')

        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_login_missing_password(self, api_client, test_user):
        """Test login with missing password"""
        url = reverse('login')
        data = {
            'username': 'testuser'
        }

        response = api_client.post(url, data, format='json')

        assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
class TestLogout:
    """Test user logout"""

    def test_logout_authenticated_user(self, api_client, test_user):
        """Test logout for authenticated user"""
        # Login first
        api_client.force_authenticate(user=test_user)

        url = reverse('logout')
        response = api_client.post(url)

        assert response.status_code == status.HTTP_200_OK
        assert response.data['message'] == 'Logout successful'

    def test_logout_unauthenticated_user(self, api_client):
        """Test logout for unauthenticated user"""
        url = reverse('logout')
        response = api_client.post(url)

        # Should still succeed (logout is idempotent)
        assert response.status_code == status.HTTP_200_OK


@pytest.mark.django_db
class TestUserProfile:
    """Test user profile endpoint"""

    def test_get_profile_authenticated(self, api_client, test_user):
        """Test getting profile for authenticated user"""
        api_client.force_authenticate(user=test_user)

        url = reverse('user_profile')
        response = api_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert 'user' in response.data
        assert response.data['user']['username'] == 'testuser'
        assert response.data['user']['email'] == 'test@example.com'
        assert response.data['user']['first_name'] == 'Test'
        assert response.data['user']['last_name'] == 'User'

    def test_get_profile_unauthenticated(self, api_client):
        """Test getting profile without authentication"""
        url = reverse('user_profile')
        response = api_client.get(url)

        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        assert 'error' in response.data
        assert response.data['error'] == 'Not authenticated'

    def test_profile_does_not_expose_password(self, api_client, test_user):
        """Test that profile does not expose password"""
        api_client.force_authenticate(user=test_user)

        url = reverse('user_profile')
        response = api_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert 'password' not in response.data['user']


@pytest.mark.django_db
class TestAuthenticationIntegration:
    """Test complete authentication flows"""

    def test_signup_then_logout_then_login(self, api_client):
        """Test complete flow: signup -> logout -> login"""
        # Signup
        signup_url = reverse('signup')
        signup_data = {
            'username': 'flowuser',
            'email': 'flow@example.com',
            'password': 'password123',
            'password_confirm': 'password123',
            'first_name': 'Flow',
            'last_name': 'User'
        }
        signup_response = api_client.post(signup_url, signup_data, format='json')
        assert signup_response.status_code == status.HTTP_201_CREATED

        # Logout
        logout_url = reverse('logout')
        logout_response = api_client.post(logout_url)
        assert logout_response.status_code == status.HTTP_200_OK

        # Login
        login_url = reverse('login')
        login_data = {
            'username': 'flowuser',
            'password': 'password123'
        }
        login_response = api_client.post(login_url, login_data, format='json')
        assert login_response.status_code == status.HTTP_200_OK
        assert login_response.data['user']['username'] == 'flowuser'

    def test_profile_access_after_authentication(self, api_client):
        """Test profile access after login"""
        # Create user
        user = User.objects.create_user(
            username='profileuser',
            email='profile@example.com',
            password='password123'
        )

        # Login
        login_url = reverse('login')
        login_data = {
            'username': 'profileuser',
            'password': 'password123'
        }
        login_response = api_client.post(login_url, login_data, format='json')
        assert login_response.status_code == status.HTTP_200_OK

        # Access profile
        profile_url = reverse('user_profile')
        profile_response = api_client.get(profile_url)
        assert profile_response.status_code == status.HTTP_200_OK
        assert profile_response.data['user']['username'] == 'profileuser'

    def test_session_persistence(self, api_client, test_user):
        """Test that session persists across requests"""
        # Login
        login_url = reverse('login')
        login_data = {
            'username': 'testuser',
            'password': 'testpass123'
        }
        login_response = api_client.post(login_url, login_data, format='json')
        assert login_response.status_code == status.HTTP_200_OK

        # Make multiple requests with same client
        profile_url = reverse('user_profile')
        response1 = api_client.get(profile_url)
        response2 = api_client.get(profile_url)

        assert response1.status_code == status.HTTP_200_OK
        assert response2.status_code == status.HTTP_200_OK
        assert response1.data['user']['username'] == 'testuser'
        assert response2.data['user']['username'] == 'testuser'
