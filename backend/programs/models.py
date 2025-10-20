# Names: Daniel, Jacob, Maharshi, Ben
# Total time: 15 mins 

from django.db import models

class Program(models.Model):
    program_id = models.CharField(max_length=20, unique=True, primary_key=True)
    name = models.CharField(max_length=255)
    academic_calendar = models.CharField(max_length=255, blank=True)
    program_type = models.CharField(max_length=100, blank=True)
    minimum_gpa = models.CharField(max_length=10, blank=True)
    language_prerequisite = models.CharField(max_length=50, blank=True)
    additional_prerequisites = models.TextField(blank=True)
    housing = models.TextField(blank=True)
    main_page_url = models.URLField(blank=True)
    homepage_url = models.URLField(blank=True)
    budget_page_url = models.URLField(blank=True)
    latitude = models.FloatField()
    longitude = models.FloatField()
    
    def __str__(self):
        return self.name


class BudgetInfo(models.Model):
    program = models.ForeignKey(Program, related_name='budget_info', on_delete=models.CASCADE)
    term = models.CharField(max_length=50)
    year = models.IntegerField()
    total_estimated_cost = models.CharField(max_length=50)
    
    class Meta:
        unique_together = ['program', 'term', 'year']
    
    def __str__(self):
        return f"{self.program.name} - {self.term} {self.year}"


class ProgramSection(models.Model):
    program = models.ForeignKey(Program, related_name='sections', on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    content = models.JSONField()  # Store as JSON array
    order = models.IntegerField(default=0)
    
    class Meta:
        ordering = ['order']
    
    def __str__(self):
        return f"{self.program.name} - {self.title}"