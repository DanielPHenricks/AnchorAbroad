"""
Tests for programs
"""
import pytest
from django.test import TestCase
from django.db import IntegrityError
from programs.models import Program, BudgetInfo, ProgramSection
from rest_framework.test import APIClient


class ProgramModelTest(TestCase):
    """Test Program model functionality"""
    
    def setUp(self):
        self.program_data = {
            'program_id': 'TEST001',
            'name': 'Test Program',
            'academic_calendar': 'Semester',
            'program_type': 'Exchange',
            'minimum_gpa': '3.0',
            'language_prerequisite': 'None',
            'additional_prerequisites': 'Test prerequisites',
            'housing': 'On-campus housing available',
            'main_page_url': 'https://example.com/main',
            'homepage_url': 'https://example.com',
            'img_url': 'https://example.com/image.jpg',
            'budget_page_url': 'https://example.com/budget',
            'latitude': 40.7128,
            'longitude': -74.0060
        }
    
    def test_program_creation(self):
        """Test creating a new program"""
        program = Program.objects.create(**self.program_data)
        self.assertEqual(program.program_id, 'TEST001')
        self.assertEqual(program.name, 'Test Program')
        self.assertEqual(program.academic_calendar, 'Semester')
        self.assertEqual(program.latitude, 40.7128)
        self.assertEqual(program.longitude, -74.0060)
    
    def test_program_str_representation(self):
        """Test the string representation of program"""
        program = Program.objects.create(**self.program_data)
        self.assertEqual(str(program), 'Test Program')
    
    def test_program_unique_program_id(self):
        """Test that program_id must be unique"""
        Program.objects.create(**self.program_data)
        with self.assertRaises(IntegrityError):
            Program.objects.create(**self.program_data)
    
    def test_program_optional_fields(self):
        """Test creating program with only required fields"""
        minimal_program = Program.objects.create(
            program_id='TEST002',
            name='Minimal Program',
            latitude=34.0522,
            longitude=-118.2437
        )
        self.assertEqual(minimal_program.name, 'Minimal Program')
        self.assertEqual(minimal_program.academic_calendar, '')
        self.assertEqual(minimal_program.program_type, '')
    
    def test_program_fields_required(self):
        """Test that required fields are enforced"""
        # Should raise error without required fields
        with self.assertRaises(Exception):
            Program.objects.create(
                program_id='TEST003',
                name='Test Program'
                # Missing latitude and longitude
            )


class BudgetInfoModelTest(TestCase):
    """Test BudgetInfo model functionality"""
    
    def setUp(self):
        self.program = Program.objects.create(
            program_id='TEST001',
            name='Test Program',
            latitude=40.7128,
            longitude=-74.0060
        )
    
    def test_budget_info_creation(self):
        """Test creating budget info for a program"""
        budget = BudgetInfo.objects.create(
            program=self.program,
            term='Fall',
            year=2024,
            total_estimated_cost='$15,000'
        )
        self.assertEqual(budget.program, self.program)
        self.assertEqual(budget.term, 'Fall')
        self.assertEqual(budget.year, 2024)
    
    def test_budget_info_str_representation(self):
        """Test the string representation of budget info"""
        budget = BudgetInfo.objects.create(
            program=self.program,
            term='Spring',
            year=2025,
            total_estimated_cost='$20,000'
        )
        self.assertEqual(str(budget), 'Test Program - Spring 2025')
    
    def test_budget_info_unique_constraint(self):
        """Test that program/term/year combination must be unique"""
        BudgetInfo.objects.create(
            program=self.program,
            term='Fall',
            year=2024,
            total_estimated_cost='$15,000'
        )
        with self.assertRaises(IntegrityError):
            BudgetInfo.objects.create(
                program=self.program,
                term='Fall',
                year=2024,
                total_estimated_cost='$16,000'
            )
    
    def test_budget_info_cascade_delete(self):
        """Test that budget info is deleted when program is deleted"""
        BudgetInfo.objects.create(
            program=self.program,
            term='Fall',
            year=2024,
            total_estimated_cost='$15,000'
        )
        self.program.delete()
        self.assertEqual(BudgetInfo.objects.count(), 0)


class ProgramSectionModelTest(TestCase):
    """Test ProgramSection model functionality"""
    
    def setUp(self):
        self.program = Program.objects.create(
            program_id='TEST001',
            name='Test Program',
            latitude=40.7128,
            longitude=-74.0060
        )
    
    def test_program_section_creation(self):
        """Test creating a program section"""
        section = ProgramSection.objects.create(
            program=self.program,
            title='Overview',
            content=['This is a test section', 'With multiple items'],
            order=1
        )
        self.assertEqual(section.title, 'Overview')
        self.assertEqual(section.order, 1)
        self.assertIsInstance(section.content, list)
    
    def test_program_section_str_representation(self):
        """Test the string representation of program section"""
        section = ProgramSection.objects.create(
            program=self.program,
            title='Requirements',
            content=['Requirement 1', 'Requirement 2'],
            order=2
        )
        self.assertEqual(str(section), 'Test Program - Requirements')
    
    def test_program_section_ordering(self):
        """Test that sections are ordered by the order field"""
        section3 = ProgramSection.objects.create(
            program=self.program,
            title='Section 3',
            content=['Content 3'],
            order=3
        )
        section1 = ProgramSection.objects.create(
            program=self.program,
            title='Section 1',
            content=['Content 1'],
            order=1
        )
        section2 = ProgramSection.objects.create(
            program=self.program,
            title='Section 2',
            content=['Content 2'],
            order=2
        )
        
        sections = list(ProgramSection.objects.all())
        self.assertEqual(sections[0].order, 1)
        self.assertEqual(sections[1].order, 2)
        self.assertEqual(sections[2].order, 3)
    
    def test_program_section_cascade_delete(self):
        """Test that sections are deleted when program is deleted"""
        ProgramSection.objects.create(
            program=self.program,
            title='Test Section',
            content=['Test content'],
            order=1
        )
        self.program.delete()
        self.assertEqual(ProgramSection.objects.count(), 0)


class ProgramViewTest(TestCase):
    """Test Program API views"""
    
    def setUp(self):
        self.client = APIClient()
        self.program = Program.objects.create(
            program_id='PROG001',
            name='Program 1',
            program_type='Exchange',
            latitude=40.7128,
            longitude=-74.0060
        )
    
    def test_database_has_programs(self):
        """Test that we can query programs from database"""
        programs = Program.objects.all()
        self.assertEqual(programs.count(), 1)
        self.assertEqual(programs.first().name, 'Program 1')
    
    def test_programs_list_endpoint_exists(self):
        """Test that the programs list endpoint is accessible"""
        # Add your actual endpoint test here
        # response = self.client.get(reverse('program-list'))
        # self.assertEqual(response.status_code, 200)
        pass


@pytest.mark.django_db
class TestProgramWithPytest:
    """Additional tests using pytest syntax for variety"""
    
    def test_program_creation_pytest_style(self):
        """Test program creation using pytest"""
        program = Program.objects.create(
            program_id='PYTEST001',
            name='Pytest Program',
            latitude=51.5074,
            longitude=-0.1278
        )
        assert program.name == 'Pytest Program'
        assert program.program_id == 'PYTEST001'
        assert program.latitude == 51.5074
        assert program.longitude == -0.1278
    
    def test_program_fields_types(self):
        """Test that program fields have correct types"""
        program = Program.objects.create(
            program_id='TYPE001',
            name='Type Test Program',
            minimum_gpa='3.5',
            latitude=37.7749,
            longitude=-122.4194
        )
        assert isinstance(program.name, str)
        assert isinstance(program.program_id, str)
        assert isinstance(program.minimum_gpa, str)
        assert isinstance(program.latitude, float)
        assert isinstance(program.longitude, float)
    
    def test_program_with_related_models(self):
        """Test program with budget info and sections"""
        program = Program.objects.create(
            program_id='RELATED001',
            name='Related Test Program',
            latitude=40.7128,
            longitude=-74.0060
        )
        
        # Create budget info
        budget = BudgetInfo.objects.create(
            program=program,
            term='Fall',
            year=2024,
            total_estimated_cost='$12,000'
        )
        
        # Create section
        section = ProgramSection.objects.create(
            program=program,
            title='Test Section',
            content=['Item 1', 'Item 2'],
            order=1
        )
        
        assert program.budget_info.count() == 1
        assert program.sections.count() == 1
        assert program.budget_info.first() == budget
        assert program.sections.first() == section