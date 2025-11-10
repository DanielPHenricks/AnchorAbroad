"""
Tests for programs
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