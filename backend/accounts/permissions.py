from rest_framework.permissions import BasePermission


class IsAuthenticatedOrAlumni(BasePermission):
    """
    Custom permission to allow access to authenticated users OR alumni.
    - Checks if user is authenticated (Django User)
    - OR checks if alumni_id exists in session
    """
    
    def has_permission(self, request, view):
        # Check if regular user is authenticated
        if request.user and request.user.is_authenticated:
            return True
        
        # Check if alumni is authenticated via session
        if 'alumni_id' in request.session:
            return True
        
        return False
