import os
import re
import uuid
import struct
import base64
import subprocess
import psycopg2
from typing import Tuple, Dict, Any, Optional

from engine.poster_models import PosterContentContract

CHROME_BIN = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

DB_CONFIG = {
    "dbname": os.environ.get("PGDATABASE", "ai_img"),
    "user": os.environ.get("PGUSER", "postgres"),
    "password": os.environ.get("PGPASSWORD", "1234"),
    "host": os.environ.get("PGHOST", "localhost"),
    "port": os.environ.get("PGPORT", "5432")
}

def get_png_dimensions(filepath: str) -> Tuple[int, int]:
    with open(filepath, "rb") as f:
        data = f.read(24)
        if len(data) >= 24 and data[:8] == b'\x89PNG\r\n\x1a\n':
            w, h = struct.unpack('>LL', data[16:24])
            return int(w), int(h)
    return 0, 0

def get_image_mime(filepath: str) -> str:
    ext = os.path.splitext(filepath)[1].lower()
    if ext in (".jpg", ".jpeg"):
        return "image/jpeg"
    elif ext == ".png":
        return "image/png"
    elif ext == ".webp":
        return "image/webp"
    return "image/jpeg"

def load_as_data_uri(filepath: str, mime: Optional[str] = None) -> str:
    if os.path.exists(filepath):
        if mime is None:
            mime = get_image_mime(filepath)
        with open(filepath, "rb") as f:
            b64 = base64.b64encode(f.read()).decode("utf-8")
            return f"data:{mime};base64,{b64}"
    return ""

class PosterRenderer:
    def __init__(self, templates_dir: str = "templates", output_dir: str = "output_posters", assets_dir: str = "assets"):
        self.templates_dir = os.path.abspath(templates_dir)
        self.output_dir = os.path.abspath(output_dir)
        self.assets_dir = os.path.abspath(assets_dir)
        self.base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
        os.makedirs(self.output_dir, exist_ok=True)

        # Preload brand assets
        logo_path = os.path.abspath("logo.png")
        self.logo_uri = load_as_data_uri(logo_path, "image/png")

        hero_path = os.path.join(self.assets_dir, "corporate_hero.jpg")
        self.hero_uri = load_as_data_uri(hero_path, "image/jpeg")

        dash_path = os.path.join(self.assets_dir, "product_dashboard.jpg")
        self.dash_uri = load_as_data_uri(dash_path, "image/jpeg")

    def _render_html(self, contract: PosterContentContract) -> Tuple[str, int, int]:
        tpl_path = os.path.join(self.templates_dir, f"{contract.template_id}.html")
        if not os.path.exists(tpl_path):
            # Fallback to corporate_services if template not found
            tpl_path = os.path.join(self.templates_dir, "corporate_services.html")
            if not os.path.exists(tpl_path):
                tpl_path = os.path.join(self.templates_dir, "corporate_minimal.html")

        with open(tpl_path, "r", encoding="utf-8") as f:
            template_str = f.read()

        # Resolve target dimensions
        if contract.custom_width and contract.custom_height:
            width = contract.custom_width
            height = contract.custom_height
        elif contract.platform_preset_id:
            try:
                from shared.platform_presets import get_preset
                preset = get_preset(contract.platform_preset_id)
                if preset:
                    width = preset.width
                    height = preset.height
                else:
                    width = 1080
                    height = 1350
            except Exception:
                width = 1080
                height = 1350
        else:
            ratio_map = {
                "4:5": (1080, 1350),
                "1:1": (1080, 1080),
                "9:16": (1080, 1920),
                "1.91:1": (1200, 627),
                "16:9": (1200, 675)
            }
            width, height = ratio_map.get(contract.aspect_ratio, (1080, 1350))

        # Dynamic title font size to prevent overflow
        title_len = len(contract.title)
        if height > width:
            if title_len < 32:
                font_size = 58 if contract.aspect_ratio == "4:5" else (64 if contract.aspect_ratio == "9:16" else 48)
            elif title_len < 58:
                font_size = 46 if contract.aspect_ratio == "4:5" else (50 if contract.aspect_ratio == "9:16" else 40)
            else:
                font_size = 38 if contract.aspect_ratio == "4:5" else (42 if contract.aspect_ratio == "9:16" else 32)
        else:
            if title_len < 32:
                font_size = 46
            elif title_len < 58:
                font_size = 38
            else:
                font_size = 30

        # Hero Image & Dashboard URI resolution
        hero_uri = self.hero_uri
        dash_uri = self.dash_uri

        if contract.hero_image_path and contract.hero_image_path.strip():
            raw_path = contract.hero_image_path.strip()
            if raw_path.startswith("data:image"):
                hero_uri = raw_path
                dash_uri = raw_path
            else:
                # Resolve relative web URL or relative path to local disk path
                if raw_path.startswith("/assets/"):
                    resolved_path = os.path.join(self.base_dir, raw_path.lstrip("/"))
                elif raw_path.startswith("assets/"):
                    resolved_path = os.path.join(self.base_dir, raw_path)
                elif os.path.isabs(raw_path):
                    resolved_path = raw_path
                else:
                    resolved_path = os.path.join(self.base_dir, raw_path)

                if not os.path.exists(resolved_path) or not os.path.isfile(resolved_path):
                    raise FileNotFoundError(
                        f"Requested image asset not found at '{raw_path}' (resolved to: '{resolved_path}')"
                    )

                custom_uri = load_as_data_uri(resolved_path)
                hero_uri = custom_uri
                dash_uri = custom_uri

        # String replacements
        html = template_str
        html = html.replace("{{ width }}", str(width))
        html = html.replace("{{ height }}", str(height))
        html = html.replace("{{ title_font_size }}", str(font_size))
        html = html.replace("{{ title }}", contract.title)
        html = html.replace("{{ header }}", contract.header)
        html = html.replace("{{ description }}", contract.description)
        html = html.replace("{{ call_to_action }}", contract.call_to_action)
        html = html.replace("{{ logo_data_uri }}", self.logo_uri)
        html = html.replace("{{ hero_image_data_uri }}", hero_uri)
        html = html.replace("{{ dashboard_image_data_uri }}", dash_uri)

        # Support campaign_label
        html = html.replace("{{ campaign_label }}", contract.campaign_label or "Strategic Tech Initiative")

        # Provide individual bullet variables
        for idx in range(1, 6):
            val = contract.bullet_points[idx - 1] if idx <= len(contract.bullet_points) else ""
            html = html.replace(f"{{{{ bullet_{idx} }}}}", val)

        # Handle bullet_3 conditional
        if len(contract.bullet_points) >= 3 and contract.bullet_points[2].strip():
            html = re.sub(r'{%\s*if\s+bullet_3\s*%}(.*?){%\s*endif\s*%}', r'\1', html, flags=re.DOTALL)
        else:
            html = re.sub(r'{%\s*if\s+bullet_3\s*%}(.*?){%\s*endif\s*%}', '', html, flags=re.DOTALL)

        # Template block conditionals: {% if height >= width %} ... {% else %} ... {% endif %}
        is_vertical = height >= width
        cond_pattern = re.compile(r'{%\s*if\s+height\s*>=\s*width\s*%}(.*?){%\s*else\s*%}(.*?){%\s*endif\s*%}', re.DOTALL)
        match = cond_pattern.search(html)
        if match:
            selected_block = match.group(1) if is_vertical else match.group(2)
            html = html[:match.start()] + selected_block + html[match.end():]

        # Bullets loop replacement with slice support (e.g. bullet_points[:3] or bullet_points)
        loop_pattern = re.compile(r'{%\s*for\s+bullet\s+in\s+bullet_points(?:\[:(\d+)\])?\s*%}(.*?){%\s*endfor\s*%}', re.DOTALL)
        match = loop_pattern.search(html)
        while match:
            limit_str = match.group(1)
            limit = int(limit_str) if limit_str else len(contract.bullet_points)
            bullet_tpl = match.group(2)
            rendered_bullets = []
            for idx, b in enumerate(contract.bullet_points[:limit], start=1):
                b_str = bullet_tpl.replace("{{ bullet }}", b)
                b_str = b_str.replace("{{ loop.index }}", str(idx))
                rendered_bullets.append(b_str)
            html = html[:match.start()] + "".join(rendered_bullets) + html[match.end():]
            match = loop_pattern.search(html)

        return html, width, height

    def render_poster(
        self,
        contract: PosterContentContract,
        poster_content_id: Optional[str] = None
    ) -> Dict[str, Any]:
        poster_id = str(uuid.uuid4())
        html_content, width, height = self._render_html(contract)

        tmp_html_path = f"/tmp/poster_{poster_id}.html"
        output_filename = f"{contract.keyword_id}_{contract.template_id}_{contract.aspect_ratio.replace(':', 'x')}_{poster_id[:8]}.png"
        output_path = os.path.join(self.output_dir, output_filename)

        with open(tmp_html_path, "w", encoding="utf-8") as f:
            f.write(html_content)

        try:
            cmd = [
                CHROME_BIN,
                "--headless=new",
                "--disable-gpu",
                "--no-sandbox",
                "--hide-scrollbars",
                f"--window-size={width},{height}",
                f"--screenshot={output_path}",
                f"file://{tmp_html_path}"
            ]
            subprocess.run(cmd, check=True, capture_output=True)

            if not os.path.exists(output_path):
                raise RuntimeError(f"Rendering failed: output image {output_path} was not created.")

            actual_w, actual_h = get_png_dimensions(output_path)
            file_size = os.path.getsize(output_path)

            # Persist in PostgreSQL posters table if content ID available
            if poster_content_id:
                conn = psycopg2.connect(**DB_CONFIG)
                cur = conn.cursor()
                try:
                    cur.execute("""
                        INSERT INTO posters (
                            poster_id, poster_content_id, render_engine, output_format,
                            output_path, dimensions_width, dimensions_height, rendered_at
                        ) VALUES (%s, %s, 'chrome_headless_html_css', 'PNG', %s, %s, %s, NOW());
                    """, (poster_id, poster_content_id, output_path, actual_w, actual_h))
                    conn.commit()
                finally:
                    cur.close()
                    conn.close()

            return {
                "poster_id": poster_id,
                "output_path": output_path,
                "filename": output_filename,
                "dimensions": (actual_w, actual_h),
                "aspect_ratio": contract.aspect_ratio,
                "template_id": contract.template_id,
                "file_size_bytes": file_size,
                "status": "rendered_success"
            }

        finally:
            if os.path.exists(tmp_html_path):
                os.remove(tmp_html_path)
