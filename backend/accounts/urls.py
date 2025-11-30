# Names: Daniel, Jacob, Maharshi, Ben
# Total time: 15 mins 

from django.urls import path
from . import views

urlpatterns = [
    # Regular user endpoints
    path('signup/', views.signup_view, name='signup'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('profile/', views.user_profile_view, name='user_profile'),
    path('favorites/', views.favorites_view, name='favorites'),
    path('favorites/<str:program_id>/', views.remove_favorite_view, name='remove_favorite'),
    path('favorites/<str:program_id>/check/', views.check_favorite_view, name='check_favorite'),

    # Alumni endpoints
    path('alumni/signup/', views.alumni_signup_view, name='alumni_signup'),
    path('alumni/login/', views.alumni_login_view, name='alumni_login'),
    path('alumni/logout/', views.alumni_logout_view, name='alumni_logout'),
    path('alumni/profile/', views.alumni_profile_view, name='alumni_profile'),
    path('alumni/by-program/<str:program_id>/', views.alumni_by_program_view, name='alumni_by_program'),
]