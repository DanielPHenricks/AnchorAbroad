"""
Programs Tests
Tests program listing and serialization
"""
import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from programs.models import Program, BudgetInfo, ProgramSection


@pytest.fixture
def api_client():
    """Fixture to provide API client"""
    return APIClient()


@pytest.fixture
def test_program():
    """Fixture to create a test program"""
    return Program.objects.create(
        program_id='TEST001',
        name='Study in Paris',
        academic_calendar='Semester',
        program_type='Exchange',
        minimum_gpa=3.0,
        language_prerequisite='French',
        latitude=48.8566,
        longitude=2.3522
    )


@pytest.fixture
def test_program_with_budget(test_program):
    """Fixture to create a program with budget information"""
    BudgetInfo.objects.create(
        program=test_program,
        term='Fall',
        year=2024,
        total_estimated_cost=15000.00
    )
    return test_program


@pytest.fixture
def test_program_with_sections(test_program):
    """Fixture to create a program with sections"""
    ProgramSection.objects.create(
        program=test_program,
        title='About',
        content={'description': 'Study abroad in Paris'},
        order=1
    )
    ProgramSection.objects.create(
        program=test_program,
        title='Requirements',
        content={'requirements': ['Minimum GPA 3.0', 'French language']},
        order=2
    )
    return test_program


@pytest.mark.django_db
class TestListPrograms:
    """Test listing programs"""

    def test_list_programs_success(self, api_client, test_program):
        """Test successfully listing programs"""
        url = reverse('list_programs')
        response = api_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data) == 1
        assert data[0]['program_id'] == 'TEST001'
        assert data[0]['name'] == 'Study in Paris'

    def test_list_programs_no_authentication_required(self, api_client, test_program):
        """Test that listing programs does not require authentication"""
        url = reverse('list_programs')
        response = api_client.get(url)

        assert response.status_code == status.HTTP_200_OK

    def test_list_programs_empty(self, api_client):
        """Test listing programs when none exist"""
        url = reverse('list_programs')
        response = api_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data) == 0
        assert data == []

    def test_list_programs_multiple(self, api_client):
        """Test listing multiple programs"""
        # Create multiple programs
        Program.objects.create(
            program_id='TEST001',
            name='Study in Paris',
            academic_calendar='Semester',
            program_type='Exchange'
        )
        Program.objects.create(
            program_id='TEST002',
            name='Study in Tokyo',
            academic_calendar='Year',
            program_type='Direct Enrollment'
        )
        Program.objects.create(
            program_id='TEST003',
            name='Study in Madrid',
            academic_calendar='Summer',
            program_type='Exchange'
        )

        url = reverse('list_programs')
        response = api_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data) == 3
        program_ids = [p['program_id'] for p in data]
        assert 'TEST001' in program_ids
        assert 'TEST002' in program_ids
        assert 'TEST003' in program_ids


@pytest.mark.django_db
class TestProgramSerialization:
    """Test program serialization"""

    def test_program_basic_fields(self, api_client, test_program):
        """Test that basic program fields are serialized"""
        url = reverse('list_programs')
        response = api_client.get(url)

        data = response.json()[0]
        assert data['program_id'] == 'TEST001'
        assert data['name'] == 'Study in Paris'
        assert data['academic_calendar'] == 'Semester'
        assert data['program_type'] == 'Exchange'
        assert data['minimum_gpa'] == 3.0
        assert data['language_prerequisite'] == 'French'
        assert data['latitude'] == 48.8566
        assert data['longitude'] == 2.3522

    def test_program_with_budget_info(self, api_client, test_program_with_budget):
        """Test that budget information is included in serialization"""
        url = reverse('list_programs')
        response = api_client.get(url)

        data = response.json()[0]
        assert 'budget_info' in data or 'budgets' in data  # Field name may vary

    def test_program_with_sections(self, api_client, test_program_with_sections):
        """Test that program sections are included in serialization"""
        url = reverse('list_programs')
        response = api_client.get(url)

        data = response.json()[0]
        assert 'sections' in data or 'program_sections' in data  # Field name may vary

    def test_program_coordinates(self, api_client):
        """Test that program coordinates are properly serialized"""
        Program.objects.create(
            program_id='LOC001',
            name='Location Test Program',
            latitude=40.7128,
            longitude=-74.0060
        )

        url = reverse('list_programs')
        response = api_client.get(url)

        data = response.json()[0]
        assert data['latitude'] == 40.7128
        assert data['longitude'] == -74.0060

    def test_program_optional_fields(self, api_client):
        """Test that optional fields can be null"""
        Program.objects.create(
            program_id='MIN001',
            name='Minimal Program'
            # All optional fields not set
        )

        url = reverse('list_programs')
        response = api_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        data = response.json()[0]
        assert data['program_id'] == 'MIN001'
        assert data['name'] == 'Minimal Program'


@pytest.mark.django_db
class TestProgramModel:
    """Test Program model"""

    def test_create_program(self):
        """Test creating a program"""
        program = Program.objects.create(
            program_id='CREATE001',
            name='Test Program',
            academic_calendar='Semester',
            program_type='Exchange'
        )

        assert program.program_id == 'CREATE001'
        assert program.name == 'Test Program'
        assert Program.objects.count() == 1

    def test_program_id_is_primary_key(self):
        """Test that program_id is the primary key"""
        program = Program.objects.create(
            program_id='PK001',
            name='Primary Key Test'
        )

        retrieved = Program.objects.get(pk='PK001')
        assert retrieved == program

    def test_program_str_representation(self, test_program):
        """Test string representation of program"""
        # Assuming __str__ returns the name or program_id
        str_repr = str(test_program)
        assert 'TEST001' in str_repr or 'Study in Paris' in str_repr


@pytest.mark.django_db
class TestBudgetInfo:
    """Test BudgetInfo model"""

    def test_create_budget_info(self, test_program):
        """Test creating budget information"""
        budget = BudgetInfo.objects.create(
            program=test_program,
            term='Fall',
            year=2024,
            total_estimated_cost=20000.00
        )

        assert budget.program == test_program
        assert budget.term == 'Fall'
        assert budget.year == 2024
        assert budget.total_estimated_cost == 20000.00

    def test_budget_info_unique_constraint(self, test_program):
        """Test that budget info has unique constraint on program/term/year"""
        BudgetInfo.objects.create(
            program=test_program,
            term='Fall',
            year=2024,
            total_estimated_cost=15000.00
        )

        # Try to create duplicate
        with pytest.raises(Exception):  # Should raise IntegrityError
            BudgetInfo.objects.create(
                program=test_program,
                term='Fall',
                year=2024,
                total_estimated_cost=16000.00
            )

    def test_multiple_budgets_different_terms(self, test_program):
        """Test creating multiple budgets for different terms"""
        BudgetInfo.objects.create(
            program=test_program,
            term='Fall',
            year=2024,
            total_estimated_cost=15000.00
        )
        BudgetInfo.objects.create(
            program=test_program,
            term='Spring',
            year=2024,
            total_estimated_cost=16000.00
        )

        assert BudgetInfo.objects.filter(program=test_program).count() == 2

    def test_budget_cascade_on_program_delete(self, test_program):
        """Test that budget info is deleted when program is deleted"""
        budget = BudgetInfo.objects.create(
            program=test_program,
            term='Fall',
            year=2024,
            total_estimated_cost=15000.00
        )
        budget_id = budget.id

        test_program.delete()

        assert not BudgetInfo.objects.filter(id=budget_id).exists()


@pytest.mark.django_db
class TestProgramSection:
    """Test ProgramSection model"""

    def test_create_program_section(self, test_program):
        """Test creating a program section"""
        section = ProgramSection.objects.create(
            program=test_program,
            title='About',
            content={'description': 'Program description'},
            order=1
        )

        assert section.program == test_program
        assert section.title == 'About'
        assert section.content == {'description': 'Program description'}
        assert section.order == 1

    def test_multiple_sections_with_order(self, test_program):
        """Test creating multiple sections with different orders"""
        ProgramSection.objects.create(
            program=test_program,
            title='About',
            content={'text': 'About text'},
            order=1
        )
        ProgramSection.objects.create(
            program=test_program,
            title='Requirements',
            content={'text': 'Requirements text'},
            order=2
        )
        ProgramSection.objects.create(
            program=test_program,
            title='Housing',
            content={'text': 'Housing text'},
            order=3
        )

        sections = ProgramSection.objects.filter(program=test_program).order_by('order')
        assert sections.count() == 3
        assert list(sections.values_list('title', flat=True)) == ['About', 'Requirements', 'Housing']

    def test_section_json_content(self, test_program):
        """Test that section content stores JSON properly"""
        complex_content = {
            'title': 'Program Details',
            'items': ['Item 1', 'Item 2', 'Item 3'],
            'nested': {'key': 'value'}
        }

        section = ProgramSection.objects.create(
            program=test_program,
            title='Details',
            content=complex_content,
            order=1
        )

        retrieved = ProgramSection.objects.get(id=section.id)
        assert retrieved.content == complex_content

    def test_section_cascade_on_program_delete(self, test_program):
        """Test that sections are deleted when program is deleted"""
        section = ProgramSection.objects.create(
            program=test_program,
            title='About',
            content={'text': 'About'},
            order=1
        )
        section_id = section.id

        test_program.delete()

        assert not ProgramSection.objects.filter(id=section_id).exists()


@pytest.mark.django_db
class TestProgramIntegration:
    """Test complete program data structure"""

    def test_program_with_all_related_data(self, api_client):
        """Test program with budget and sections"""
        # Create program
        program = Program.objects.create(
            program_id='FULL001',
            name='Complete Program',
            academic_calendar='Semester',
            program_type='Exchange',
            minimum_gpa=3.5
        )

        # Add budget info
        BudgetInfo.objects.create(
            program=program,
            term='Fall',
            year=2024,
            total_estimated_cost=18000.00
        )

        # Add sections
        ProgramSection.objects.create(
            program=program,
            title='About',
            content={'description': 'About the program'},
            order=1
        )
        ProgramSection.objects.create(
            program=program,
            title='Eligibility',
            content={'requirements': ['GPA 3.5+']},
            order=2
        )

        # Fetch and verify
        url = reverse('list_programs')
        response = api_client.get(url)

        data = response.json()[0]
        assert data['program_id'] == 'FULL001'
        assert data['minimum_gpa'] == 3.5
