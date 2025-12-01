# Names: Daniel, Jacob, Maharshi, Ben
# Total time: 15 mins 

from rest_framework import serializers
from .models import Program, BudgetInfo, ProgramSection, Review


class BudgetInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = BudgetInfo
        fields = ['term', 'year', 'total_estimated_cost']


class ProgramSectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProgramSection
        fields = ['title', 'content']


class ProgramSerializer(serializers.ModelSerializer):
    program_details = serializers.SerializerMethodField()
    budget_info = serializers.SerializerMethodField()
    reviews = serializers.SerializerMethodField()
    sections = ProgramSectionSerializer(many=True, read_only=True)
    
    class Meta:
        model = Program
        fields = ['program_id', 'program_details', 'budget_info', 
                 'main_page_url', 'homepage_url', 'sections', 'budget_page_url', 'img_url',
                 'latitude', 'longitude', 'continent', 'reviews']
    
    def get_program_details(self, obj):
        return {
            'name': obj.name,
            'academic_calendar': obj.academic_calendar,
            'program_type': obj.program_type,
            'minimum_gpa': obj.minimum_gpa,
            'language_prerequisite': obj.language_prerequisite,
            'additional_prerequisites': obj.additional_prerequisites,
            'housing': obj.housing
        }
    
    def get_budget_info(self, obj):
        budget_data = {}
        for budget in obj.budget_info.all():
            key = f"{budget.term.lower()}_{budget.year}"
            budget_data[key] = {
                'term': budget.term,
                'year': str(budget.year),
                'total_estimated_cost': budget.total_estimated_cost
            }
        return budget_data

    def get_reviews(self, obj):
        reviews = obj.reviews.all()
        return ReviewSerializer(reviews, many=True).data


class ReviewSerializer(serializers.ModelSerializer):
    alumni_name = serializers.SerializerMethodField()
    alumni_year = serializers.SerializerMethodField()
    alumni_program = serializers.SerializerMethodField()
    program_name = serializers.SerializerMethodField()

    class Meta:
        model = Review
        fields = ['id', 'program', 'program_name', 'alumni', 'alumni_name', 'alumni_year', 'alumni_program', 'text', 'rating', 'date']
        read_only_fields = ['alumni']

    def get_alumni_name(self, obj):
        return f"{obj.alumni.first_name} {obj.alumni.last_name}"

    def get_alumni_year(self, obj):
        return obj.alumni.graduation_year

    def get_alumni_program(self, obj):
        return obj.alumni.program.name

    def get_program_name(self, obj):
        return obj.program.name