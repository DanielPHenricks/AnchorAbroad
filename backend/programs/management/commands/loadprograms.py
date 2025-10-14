from django.core.management.base import BaseCommand
from programs.models import Program

class Command(BaseCommand):
    help = 'Load European city programs into the database'

    def handle(self, *args, **options):
        programs_data = [
            {
                'name': 'Madrid',
                'description': 'The vibrant capital of Spain, known for its rich history, world-class museums like the Prado, and bustling nightlife. Home to the Royal Palace and beautiful Retiro Park.',
                'latitude': 40.4167,
                'longitude': -3.7033,
            },
            {
                'name': 'Paris',
                'description': 'The City of Light, famous for the Eiffel Tower, Louvre Museum, and charming cafés. A global center for art, fashion, and culture.',
                'latitude': 48.8566,
                'longitude': 2.3522,
            },
            {
                'name': 'London',
                'description': 'Historic capital of the UK, featuring iconic landmarks like Big Ben, Tower Bridge, and Buckingham Palace. A major financial and cultural hub.',
                'latitude': 51.5074,
                'longitude': -0.1278,
            },
            {
                'name': 'Berlin',
                'description': "Germany's dynamic capital, rich in history from the Berlin Wall to modern innovation. Known for its vibrant arts scene and tech startups.",
                'latitude': 52.52,
                'longitude': 13.405,
            },
            {
                'name': 'Rome',
                'description': 'The Eternal City, home to ancient wonders like the Colosseum and Vatican City. A living museum of Western civilization and incredible cuisine.',
                'latitude': 41.9028,
                'longitude': 12.4964,
            },
        ]

        created_count = 0
        updated_count = 0

        for program_data in programs_data:
            program, created = Program.objects.update_or_create(
                name=program_data['name'],
                defaults={
                    'description': program_data['description'],
                    'latitude': program_data['latitude'],
                    'longitude': program_data['longitude'],
                }
            )

            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'Created program: {program.name}')
                )
            else:
                updated_count += 1
                self.stdout.write(
                    self.style.WARNING(f'Updated program: {program.name}')
                )

        self.stdout.write(
            self.style.SUCCESS(
                f'\nCompleted! Created: {created_count}, Updated: {updated_count}'
            )
        )