"""
Test cases for Programs app - following 80/20 principle
Tests the most critical functionality with minimal effort
"""
import pytest
from django.test import TestCase, Client
from django.urls import reverse
from programs.models import Program
from rest_framework.test import APIClient
import json


class ProgramModelTest(TestCase):
    """Test Program model functionality"""
    
    def setUp(self):
        self.program_data = {
            'name': 'Test Program',
            'description': 'A test program for unit testing',
            'latitude': 40.7128,
            'longitude': -74.0060
        }
    
    def test_program_creation(self):
        """Test creating a new program"""
        program = Program.objects.create(**self.program_data)
        self.assertEqual(program.name, 'Test Program')
        self.assertEqual(program.description, 'A test program for unit testing')
        self.assertEqual(program.latitude, 40.7128)
        self.assertEqual(program.longitude, -74.0060)
    
    def test_program_str_representation(self):
        """Test the string representation of program"""
        program = Program.objects.create(**self.program_data)
        # Program model doesn't have __str__ method, so it will use default
        self.assertIn('Program object', str(program))
    
    def test_program_unique_name(self):
        """Test that program names must be unique"""
        Program.objects.create(**self.program_data)
        with self.assertRaises(Exception):  # Should raise IntegrityError
            Program.objects.create(**self.program_data)


class ProgramViewTest(TestCase):
    """Test Program API views"""
    
    def setUp(self):
        self.client = APIClient()
        self.program1 = Program.objects.create(
            name='Program 1',
            description='First test program',
            latitude=40.7128,
            longitude=-74.0060
        )
        self.program2 = Program.objects.create(
            name='Program 2',
            description='Second test program',
            latitude=34.0522,
            longitude=-118.2437
        )
    
    def test_list_programs_endpoint(self):
        """Test the list programs API endpoint"""
        url = reverse('list_programs')  # Assumes URL name is 'list_programs'
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, 200)
        
        # Parse JSON response
        data = json.loads(response.content)
        self.assertEqual(len(data), 2)
        
        # Check if our test programs are in the response
        program_names = [program['name'] for program in data]
        self.assertIn('Program 1', program_names)
        self.assertIn('Program 2', program_names)
    
    def test_list_programs_contains_required_fields(self):
        """Test that program list contains all required fields"""
        url = reverse('list_programs')
        response = self.client.get(url)
        data = json.loads(response.content)
        
        # Check first program has all required fields
        program = data[0]
        required_fields = ['name', 'description', 'latitude', 'longitude']
        for field in required_fields:
            self.assertIn(field, program)
    
    def test_empty_programs_list(self):
        """Test API response when no programs exist"""
        Program.objects.all().delete()
        
        url = reverse('list_programs')
        response = self.client.get(url)
        data = json.loads(response.content)
        
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(data), 0)


@pytest.mark.django_db
class TestProgramWithPytest:
    """Additional tests using pytest syntax for variety"""
    
    def test_program_creation_pytest_style(self):
        """Test program creation using pytest"""
        program = Program.objects.create(
            name='Pytest Program',
            description='Testing with pytest',
            latitude=51.5074,
            longitude=-0.1278
        )
        assert program.name == 'Pytest Program'
        assert program.latitude == 51.5074
        assert program.longitude == -0.1278
    
    def test_program_fields_types(self):
        """Test that program fields have correct types"""
        program = Program.objects.create(
            name='Type Test Program',
            description='Testing field types',
            latitude=37.7749,
            longitude=-122.4194
        )
        assert isinstance(program.name, str)
        assert isinstance(program.description, str)
        assert isinstance(program.latitude, float)
        assert isinstance(program.longitude, float)