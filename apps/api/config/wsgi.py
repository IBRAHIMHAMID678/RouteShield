"""
WSGI config for weather-aware truck routing project.
"""

import os
from django.core.wsgi import get_wsgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "apps.api.config.settings")
application = get_wsgi_application()
