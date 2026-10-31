import os
from dotenv import load_dotenv
from pydantic_settings import BaseSettings

# Load environment variables from .env
load_dotenv()

class Settings(BaseSettings):
    PROJECT_NAME: str = "InfiniteTech AI Poster Studio"
    VERSION: str = "2.0.0"
    
    # Database
    PGDATABASE: str = os.environ.get("PGDATABASE", "ai_img")
    PGUSER: str = os.environ.get("PGUSER", "postgres")
    PGPASSWORD: str = os.environ.get("PGPASSWORD", "1234")
    PGHOST: str = os.environ.get("PGHOST", "localhost")
    PGPORT: str = os.environ.get("PGPORT", "5432")
    
    # Chrome Binary
    CHROME_BIN: str = os.environ.get("CHROME_BIN", "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome")
    
    # Pollinations AI
    POLLINATIONS_API_KEY: str = os.environ.get("POLLINATIONS_API_KEY", "")
    POLLINATIONS_BASE_URL: str = os.environ.get("POLLINATIONS_BASE_URL", "https://gen.pollinations.ai")
    POLLINATIONS_DEFAULT_MODEL: str = os.environ.get("POLLINATIONS_DEFAULT_MODEL", "black-forest-labs/flux.1-schnell")
    
    # Paths
    BASE_DIR: str = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
    ASSETS_DIR: str = os.path.join(BASE_DIR, "assets")
    TEMPLATES_DIR: str = os.path.join(BASE_DIR, "templates")
    OUTPUT_DIR: str = os.path.join(BASE_DIR, "output_posters")
    GENERATED_IMAGES_DIR: str = os.path.join(ASSETS_DIR, "generated-images")

    @property
    def db_config(self):
        return {
            "dbname": self.PGDATABASE,
            "user": self.PGUSER,
            "password": self.PGPASSWORD,
            "host": self.PGHOST,
            "port": self.PGPORT
        }

settings = Settings()
