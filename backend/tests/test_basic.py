"""
Basic Django functionality tests
Simple smoke tests to ensure basic setup works
"""
from django.test import TestCase, Client
from django.contrib.auth.models import User


class BasicDjangoTest(TestCase):
    """Test basic Django functionality"""
    
    def setUp(self):
        self.client = Client()
    
    def test_django_is_working(self):
        """Basic test to ensure Django test framework works"""
        self.assertTrue(True)
    
    def test_database_connection(self):
        """Test that database operations work"""
        # Create a user to test database
        user = User.objects.create_user(
            username='testuser',
            password='testpass123'
        )
        self.assertEqual(user.username, 'testuser')
        
        # Test query
        users = User.objects.filter(username='testuser')
        self.assertEqual(users.count(), 1)
    
    def test_settings_import(self):
        """Test that Django settings can be imported"""
        from django.conf import settings
        self.assertIsNotNone(settings.SECRET_KEY)
        self.assertTrue(hasattr(settings, 'INSTALLED_APPS'))


class UrlTest(TestCase):
    """Test basic URL routing"""
    
    def test_admin_url_exists(self):
        """Test that admin URL is accessible (will redirect to login)"""
        response = self.client.get('/admin/')
        # Should redirect to login page (302) or show admin login (200)
        self.assertIn(response.status_code, [200, 302])