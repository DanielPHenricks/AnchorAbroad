from rest_framework.authentication import SessionAuthentication


class CsrfExemptSessionAuthentication(SessionAuthentication):
    """
    SessionAuthentication without CSRF enforcement.
    Use with caution - only appropriate for development or when using alternative security measures.
    """
    def enforce_csrf(self, request):
        return  # Skip CSRF check
