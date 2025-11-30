from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from .models import Program, Review
from accounts.models import Alumni
from django.contrib.auth.models import User

class ReviewTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.program = Program.objects.create(
            program_id='test_program',
            name='Test Program',
            latitude=0.0,
            longitude=0.0
        )
        self.alumni = Alumni.objects.create(
            email='alumni@test.com',
            first_name='John',
            last_name='Doe',
            program=self.program,
            graduation_year=2020
        )
        self.user = User.objects.create_user(username='student', password='password')

    def test_alumni_can_create_review(self):
        # Simulate alumni login (session based)
        session = self.client.session
        session['alumni_id'] = self.alumni.id
        session.save()

        url = reverse('add_review', args=[self.program.program_id])
        data = {
            'text': 'Great program!',
            'rating': 5
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Review.objects.count(), 1)
        self.assertEqual(Review.objects.get().text, 'Great program!')

    def test_student_cannot_create_review(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('add_review', args=[self.program.program_id])
        data = {
            'text': 'I want to review',
            'rating': 5
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(Review.objects.count(), 0)

    def test_anonymous_cannot_create_review(self):
        url = reverse('add_review', args=[self.program.program_id])
        data = {
            'text': 'Anonymous review',
            'rating': 5
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(Review.objects.count(), 0)
