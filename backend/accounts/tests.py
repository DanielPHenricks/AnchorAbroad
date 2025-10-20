from django.test import TestCase
from django.contrib.auth.models import User


class BasicAccountTest(TestCase):
    """Basic tests for user functionality - 80/20 principle"""
    
    def test_user_creation(self):
        """Test basic user creation"""
        user = User.objects.create_user(
            username='testuser',
            password='testpass123',
            email='test@example.com'
        )
        self.assertEqual(user.username, 'testuser')
        self.assertEqual(user.email, 'test@example.com')
        self.assertTrue(user.check_password('testpass123'))
    
    def test_user_str_representation(self):
        """Test user string representation"""
        user = User.objects.create_user(username='testuser')
        self.assertEqual(str(user), 'testuser')
    
    def test_user_is_authenticated(self):
        """Test user authentication status"""
        user = User.objects.create_user(username='testuser')
        self.assertTrue(user.is_authenticated)
