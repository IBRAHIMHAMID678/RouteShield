import os
import sys
from pathlib import Path

# Add project root directory to sys.path so apps.* can be imported cleanly
CURRENT_DIR = Path(__file__).resolve().parent
ROOT_DIR = CURRENT_DIR.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "apps.api.config.settings")

from django.core.wsgi import get_wsgi_application

# Vercel WSGI entrypoint
app = get_wsgi_application()
