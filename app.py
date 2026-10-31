"""
InfiniteTech AI Poster Studio — Primary Application Entrypoint
Delegates cleanly to the modular backend application in backend/app/main.py.
"""
from backend.app.main import app

__all__ = ["app"]
