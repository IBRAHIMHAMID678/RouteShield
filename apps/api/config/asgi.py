"""
ASGI config for weather-aware truck routing project.
"""

import os
from django.core.asgi import get_asgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "apps.api.config.settings")
application = get_asgi_application()
