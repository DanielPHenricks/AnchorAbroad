from django.contrib import admin
from .models import Alumni, Favorite, Profile


@admin.register(Alumni)
class AlumniAdmin(admin.ModelAdmin):
    list_display = ('email', 'first_name', 'last_name', 'program', 'graduation_year', 'is_active')
    list_filter = ('is_active', 'graduation_year', 'program')
    search_fields = ('email', 'first_name', 'last_name')
    ordering = ('-graduation_year',)


@admin.register(Favorite)
class FavoriteAdmin(admin.ModelAdmin):
    list_display = ('user', 'program', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('user__username', 'program__name')


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'year', 'major', 'study_abroad_term')
    search_fields = ('user__username', 'major')
