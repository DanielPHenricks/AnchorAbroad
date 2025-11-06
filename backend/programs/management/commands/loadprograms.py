# Names: Daniel, Jacob, Maharshi, Ben
# Total time: 30 mins

import json
import os
from django.core.management.base import BaseCommand
from django.conf import settings
from programs.models import Program, BudgetInfo, ProgramSection


class Command(BaseCommand):
    help = 'Load study abroad programs from JSON file into the database'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--file',
            type=str,
            default='programs/data.json',
            help='Path to the JSON file containing program data'
        )
    
    def handle(self, *args, **options):
        # Get the file path
        file_path = options['file']
        if not os.path.isabs(file_path):
            # If relative path, assume it's in the project root
            file_path = os.path.join(settings.BASE_DIR, file_path)
        
        # Check if file exists
        if not os.path.exists(file_path):
            self.stdout.write(
                self.style.ERROR(f'File not found: {file_path}')
            )
            return
        
        # Load JSON data
        try:
            with open(file_path, 'r', encoding='utf-8') as file:
                programs_data = json.load(file)
        except json.JSONDecodeError as e:
            self.stdout.write(
                self.style.ERROR(f'Invalid JSON file: {e}')
            )
            return
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Error reading file: {e}')
            )
            return
        
        created_programs = 0
        updated_programs = 0
        created_budgets = 0
        created_sections = 0
        
        # Process each program
        for program_id, data in programs_data.items():
            try:
                # Extract program details
                details = data.get('program_details', {})
                
                # Create or update the program
                program, created = Program.objects.update_or_create(
                    program_id=program_id,
                    defaults={
                        'name': details.get('name', ''),
                        'academic_calendar': details.get('academic_calendar', ''),
                        'program_type': details.get('program_type', ''),
                        'minimum_gpa': details.get('minimum_gpa', ''),
                        'language_prerequisite': details.get('language_prerequisite', ''),
                        'additional_prerequisites': details.get('additional_prerequisites', ''),
                        'housing': details.get('housing', ''),
                        'main_page_url': data.get('main_page_url', ''),
                        'homepage_url': data.get('homepage_url', ''),
                        'budget_page_url': data.get('budget_page_url', ''),
                        'img_url': data.get('img_url', ''),
                        'latitude': details.get('latitude', 0.0),
                        'longitude': details.get('longitude', 0.0),
                    }
                )
                
                if created:
                    created_programs += 1
                    self.stdout.write(
                        self.style.SUCCESS(f'Created program: {program.name}')
                    )
                else:
                    updated_programs += 1
                    self.stdout.write(
                        self.style.WARNING(f'Updated program: {program.name}')
                    )
                
                # Process budget info
                budget_info = data.get('budget_info', {})
                # Clear existing budget info for this program
                program.budget_info.all().delete()
                
                for budget_key, budget_data in budget_info.items():
                    BudgetInfo.objects.create(
                        program=program,
                        term=budget_data.get('term', ''),
                        year=int(budget_data.get('year', 0)),
                        total_estimated_cost=budget_data.get('total_estimated_cost', '')
                    )
                    created_budgets += 1
                
                # Process sections
                sections = data.get('sections', [])
                # Clear existing sections for this program
                program.sections.all().delete()
                
                for index, section in enumerate(sections):
                    ProgramSection.objects.create(
                        program=program,
                        title=section.get('title', ''),
                        content=section.get('content', []),
                        order=index
                    )
                    created_sections += 1
                    
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(
                        f'Error processing program {program_id}: {str(e)}'
                    )
                )
                continue
        
        # Print summary
        self.stdout.write(
            self.style.SUCCESS(
                f'\nCompleted!'
                f'\n  Programs - Created: {created_programs}, Updated: {updated_programs}'
                f'\n  Budget entries created: {created_budgets}'
                f'\n  Section entries created: {created_sections}'
            )
        )