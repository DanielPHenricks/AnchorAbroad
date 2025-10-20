from rest_framework import serializers
from .models import Program, BudgetInfo, ProgramSection


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
    sections = ProgramSectionSerializer(many=True, read_only=True)
    
    class Meta:
        model = Program
        fields = ['program_id', 'program_details', 'budget_info', 
                 'main_page_url', 'homepage_url', 'sections', 'budget_page_url',
                 'latitude', 'longitude']
    
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