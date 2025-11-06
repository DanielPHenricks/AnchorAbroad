"""
Favorites Tests for Accounts App
Tests favorite program functionality including add, remove, list, and check
"""
import pytest
from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from accounts.models import Favorite
from programs.models import Program


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
        password='testpass123'
    )


@pytest.fixture
def another_user():
    """Fixture to create another test user"""
    return User.objects.create_user(
        username='anotheruser',
        email='another@example.com',
        password='testpass123'
    )


@pytest.fixture
def test_program():
    """Fixture to create a test program"""
    return Program.objects.create(
        program_id='TEST001',
        name='Test Study Abroad Program',
        academic_calendar='Semester',
        program_type='Exchange'
    )


@pytest.fixture
def another_program():
    """Fixture to create another test program"""
    return Program.objects.create(
        program_id='TEST002',
        name='Another Study Program',
        academic_calendar='Year',
        program_type='Direct Enrollment'
    )


@pytest.mark.django_db
class TestGetFavorites:
    """Test getting user favorites"""

    def test_get_favorites_authenticated(self, api_client, test_user, test_program):
        """Test getting favorites for authenticated user"""
        api_client.force_authenticate(user=test_user)

        # Create a favorite
        Favorite.objects.create(user=test_user, program=test_program)

        url = reverse('favorites')
        response = api_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1
        assert response.data[0]['program']['program_id'] == 'TEST001'

    def test_get_favorites_unauthenticated(self, api_client):
        """Test getting favorites without authentication"""
        url = reverse('favorites')
        response = api_client.get(url)

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_get_favorites_empty_list(self, api_client, test_user):
        """Test getting favorites when user has no favorites"""
        api_client.force_authenticate(user=test_user)

        url = reverse('favorites')
        response = api_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 0
        assert response.data == []

    def test_get_favorites_multiple(self, api_client, test_user, test_program, another_program):
        """Test getting multiple favorites"""
        api_client.force_authenticate(user=test_user)

        # Create multiple favorites
        Favorite.objects.create(user=test_user, program=test_program)
        Favorite.objects.create(user=test_user, program=another_program)

        url = reverse('favorites')
        response = api_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 2
        program_ids = [fav['program']['program_id'] for fav in response.data]
        assert 'TEST001' in program_ids
        assert 'TEST002' in program_ids

    def test_get_favorites_user_isolation(self, api_client, test_user, another_user, test_program):
        """Test that users only see their own favorites"""
        # Create favorite for test_user
        Favorite.objects.create(user=test_user, program=test_program)

        # Authenticate as another_user
        api_client.force_authenticate(user=another_user)

        url = reverse('favorites')
        response = api_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 0  # Should not see test_user's favorites


@pytest.mark.django_db
class TestAddFavorite:
    """Test adding programs to favorites"""

    def test_add_favorite_success(self, api_client, test_user, test_program):
        """Test successfully adding a program to favorites"""
        api_client.force_authenticate(user=test_user)

        url = reverse('favorites')
        data = {'program_id': 'TEST001'}
        response = api_client.post(url, data, format='json')

        assert response.status_code == status.HTTP_201_CREATED
        assert 'program' in response.data
        assert response.data['program']['program_id'] == 'TEST001'

        # Verify in database
        assert Favorite.objects.filter(user=test_user, program=test_program).exists()

    def test_add_favorite_unauthenticated(self, api_client, test_program):
        """Test adding favorite without authentication"""
        url = reverse('favorites')
        data = {'program_id': 'TEST001'}
        response = api_client.post(url, data, format='json')

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_add_favorite_duplicate(self, api_client, test_user, test_program):
        """Test adding same program twice"""
        api_client.force_authenticate(user=test_user)

        # Add favorite first time
        Favorite.objects.create(user=test_user, program=test_program)

        # Try to add again
        url = reverse('favorites')
        data = {'program_id': 'TEST001'}
        response = api_client.post(url, data, format='json')

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'error' in response.data
        assert response.data['error'] == 'Program already favorited'

    def test_add_favorite_nonexistent_program(self, api_client, test_user):
        """Test adding favorite with non-existent program ID"""
        api_client.force_authenticate(user=test_user)

        url = reverse('favorites')
        data = {'program_id': 'NONEXISTENT'}
        response = api_client.post(url, data, format='json')

        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_add_favorite_missing_program_id(self, api_client, test_user):
        """Test adding favorite without program_id"""
        api_client.force_authenticate(user=test_user)

        url = reverse('favorites')
        data = {}
        response = api_client.post(url, data, format='json')

        assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
class TestRemoveFavorite:
    """Test removing programs from favorites"""

    def test_remove_favorite_success(self, api_client, test_user, test_program):
        """Test successfully removing a favorite"""
        api_client.force_authenticate(user=test_user)

        # Create favorite first
        Favorite.objects.create(user=test_user, program=test_program)

        url = reverse('remove_favorite', kwargs={'program_id': 'TEST001'})
        response = api_client.delete(url)

        assert response.status_code == status.HTTP_200_OK
        assert response.data['message'] == 'Favorite removed'

        # Verify removed from database
        assert not Favorite.objects.filter(user=test_user, program=test_program).exists()

    def test_remove_favorite_unauthenticated(self, api_client, test_program):
        """Test removing favorite without authentication"""
        url = reverse('remove_favorite', kwargs={'program_id': 'TEST001'})
        response = api_client.delete(url)

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_remove_favorite_not_found(self, api_client, test_user):
        """Test removing favorite that doesn't exist"""
        api_client.force_authenticate(user=test_user)

        url = reverse('remove_favorite', kwargs={'program_id': 'NONEXISTENT'})
        response = api_client.delete(url)

        assert response.status_code == status.HTTP_404_NOT_FOUND
        assert 'error' in response.data
        assert response.data['error'] == 'Favorite not found'

    def test_remove_favorite_wrong_user(self, api_client, test_user, another_user, test_program):
        """Test that user cannot remove another user's favorite"""
        # Create favorite for test_user
        Favorite.objects.create(user=test_user, program=test_program)

        # Try to remove as another_user
        api_client.force_authenticate(user=another_user)

        url = reverse('remove_favorite', kwargs={'program_id': 'TEST001'})
        response = api_client.delete(url)

        assert response.status_code == status.HTTP_404_NOT_FOUND

        # Verify test_user's favorite still exists
        assert Favorite.objects.filter(user=test_user, program=test_program).exists()


@pytest.mark.django_db
class TestCheckFavorite:
    """Test checking if program is favorited"""

    def test_check_favorite_true(self, api_client, test_user, test_program):
        """Test checking favorited program"""
        api_client.force_authenticate(user=test_user)

        # Create favorite
        Favorite.objects.create(user=test_user, program=test_program)

        url = reverse('check_favorite', kwargs={'program_id': 'TEST001'})
        response = api_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert 'is_favorite' in response.data
        assert response.data['is_favorite'] is True

    def test_check_favorite_false(self, api_client, test_user, test_program):
        """Test checking non-favorited program"""
        api_client.force_authenticate(user=test_user)

        url = reverse('check_favorite', kwargs={'program_id': 'TEST001'})
        response = api_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert 'is_favorite' in response.data
        assert response.data['is_favorite'] is False

    def test_check_favorite_unauthenticated(self, api_client):
        """Test checking favorite without authentication"""
        url = reverse('check_favorite', kwargs={'program_id': 'TEST001'})
        response = api_client.get(url)

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_check_favorite_user_specific(self, api_client, test_user, another_user, test_program):
        """Test that favorite check is user-specific"""
        # Create favorite for test_user only
        Favorite.objects.create(user=test_user, program=test_program)

        # Check as another_user
        api_client.force_authenticate(user=another_user)

        url = reverse('check_favorite', kwargs={'program_id': 'TEST001'})
        response = api_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert response.data['is_favorite'] is False


@pytest.mark.django_db
class TestFavoritesIntegration:
    """Test complete favorites workflows"""

    def test_add_check_remove_flow(self, api_client, test_user, test_program):
        """Test complete flow: add -> check -> remove -> check"""
        api_client.force_authenticate(user=test_user)

        # Add favorite
        add_url = reverse('favorites')
        add_response = api_client.post(add_url, {'program_id': 'TEST001'}, format='json')
        assert add_response.status_code == status.HTTP_201_CREATED

        # Check favorite (should be true)
        check_url = reverse('check_favorite', kwargs={'program_id': 'TEST001'})
        check_response_1 = api_client.get(check_url)
        assert check_response_1.data['is_favorite'] is True

        # Remove favorite
        remove_url = reverse('remove_favorite', kwargs={'program_id': 'TEST001'})
        remove_response = api_client.delete(remove_url)
        assert remove_response.status_code == status.HTTP_200_OK

        # Check favorite (should be false)
        check_response_2 = api_client.get(check_url)
        assert check_response_2.data['is_favorite'] is False

    def test_multiple_favorites_management(self, api_client, test_user, test_program, another_program):
        """Test managing multiple favorites"""
        api_client.force_authenticate(user=test_user)

        # Add first favorite
        add_url = reverse('favorites')
        api_client.post(add_url, {'program_id': 'TEST001'}, format='json')

        # Add second favorite
        api_client.post(add_url, {'program_id': 'TEST002'}, format='json')

        # Get all favorites
        get_url = reverse('favorites')
        get_response = api_client.get(get_url)
        assert len(get_response.data) == 2

        # Remove one favorite
        remove_url = reverse('remove_favorite', kwargs={'program_id': 'TEST001'})
        api_client.delete(remove_url)

        # Get favorites again
        get_response_2 = api_client.get(get_url)
        assert len(get_response_2.data) == 1
        assert get_response_2.data[0]['program']['program_id'] == 'TEST002'

    def test_favorite_serializer_includes_program_details(self, api_client, test_user, test_program):
        """Test that favorite response includes program details"""
        api_client.force_authenticate(user=test_user)

        Favorite.objects.create(user=test_user, program=test_program)

        url = reverse('favorites')
        response = api_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1

        favorite = response.data[0]
        assert 'program' in favorite
        assert favorite['program']['program_id'] == 'TEST001'
        assert favorite['program']['name'] == 'Test Study Abroad Program'


@pytest.mark.django_db
class TestFavoriteModel:
    """Test Favorite model constraints and behavior"""

    def test_favorite_unique_constraint(self, test_user, test_program):
        """Test that user cannot favorite same program twice"""
        # Create first favorite
        Favorite.objects.create(user=test_user, program=test_program)

        # Try to create duplicate
        with pytest.raises(Exception):  # Should raise IntegrityError
            Favorite.objects.create(user=test_user, program=test_program)

    def test_favorite_cascade_on_user_delete(self, test_user, test_program):
        """Test that favorites are deleted when user is deleted"""
        favorite = Favorite.objects.create(user=test_user, program=test_program)
        favorite_id = favorite.id

        # Delete user
        test_user.delete()

        # Favorite should be deleted
        assert not Favorite.objects.filter(id=favorite_id).exists()

    def test_favorite_cascade_on_program_delete(self, test_user, test_program):
        """Test that favorites are deleted when program is deleted"""
        favorite = Favorite.objects.create(user=test_user, program=test_program)
        favorite_id = favorite.id

        # Delete program
        test_program.delete()

        # Favorite should be deleted
        assert not Favorite.objects.filter(id=favorite_id).exists()

    def test_favorite_timestamp(self, test_user, test_program):
        """Test that favorite has created_at timestamp"""
        favorite = Favorite.objects.create(user=test_user, program=test_program)

        assert favorite.created_at is not None
