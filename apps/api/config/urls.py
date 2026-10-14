"""
Root URL Configuration.
"""

from django.contrib import admin
from django.urls import path, include, re_path
from django.views.generic import TemplateView
from django.conf import settings
from django.http import HttpResponse
import os


def index_view(request):
    """Serve frontend index.html if built, otherwise friendly dev message."""
    index_path = settings.WEB_DIST_DIR / "index.html"
    if index_path.exists():
        with open(index_path, "r", encoding="utf-8") as f:
            return HttpResponse(f.read(), content_type="text/html")
    return HttpResponse(
        "<h1>Spotter Weather-Aware Truck Routing API</h1>"
        "<p>API is active at <code>/api/v1/</code>. Frontend running via Vite dev server.</p>",
        content_type="text/html",
    )


urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/v1/", include("apps.api.route_plans.urls")),
    # Frontend SPA catch-all (excludes /api/, /admin/, and /static/)
    re_path(r"^(?!api/|admin/|static/).*$", index_view, name="spa-catchall"),
]
