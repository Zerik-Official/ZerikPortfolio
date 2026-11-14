"""Generate the portfolio's social preview images.

Draws the starfield, the spiral galaxy, the title and a row of technology
badges, then writes any of these images (1200x630):

- ``og``: Open Graph / Twitter Card image, in English (``public/og-image.png``).
- ``readme-en``: English README preview (``.github/preview.en.png``).
- ``readme-es``: Spanish README preview (``.github/preview.es.png``).

The badges use the same logos as the site (Devicon and Simple Icons, read from
``node_modules`` through ``src/lib/icons.ts``) and are rasterised with
Playwright's Chromium, so run ``bun install`` first.

Usage::

    python scripts/generate_previews.py                      # asks which images
    python scripts/generate_previews.py --images og readme-en readme-es
    python scripts/generate_previews.py --stack python react fastapi --images og
"""

# Standard library
from __future__ import annotations
import argparse
import colorsys
import io
import math
import random
import re
import sys
from dataclasses import dataclass
from pathlib import Path
from urllib.parse import quote

# Third-party
from PIL import Image, ImageChops, ImageDraw, ImageFilter, ImageFont
from playwright.sync_api import sync_playwright

ROOT: Path = Path(__file__).resolve().parent.parent
ICONS_FILE: Path = ROOT / "src" / "lib" / "icons.ts"
TECHS_FILE: Path = ROOT / "src" / "data" / "techs.ts"
NODE_MODULES: Path = ROOT / "node_modules"
FONTS: Path = Path("C:/Windows/Fonts")

WIDTH: int = 1200
HEIGHT: int = 630
MAX_STACK: int = 8
BADGE_SIZE: int = 40
BADGE_GAP: int = 8
DEFAULT_STACK: tuple[str, ...] = ("python", "javascript", "typescript", "react", "fastapi", "cpp", "mysql")


@dataclass(frozen=True)
class Preview:
    """One image the script can write."""

    path: Path
    language: str
    description: str


PREVIEWS: dict[str, Preview] = {
    "og": Preview(ROOT / "public" / "og-image.png", "en", "Open Graph / Twitter Card (English)"),
    "readme-en": Preview(ROOT / ".github" / "preview.en.png", "en", "README preview (English)"),
    "readme-es": Preview(ROOT / ".github" / "preview.es.png", "es", "README preview (Spanish)"),
}

TAGLINES: dict[str, str] = {"en": "An expedition through my universe", "es": "Una expedición por mi universo"}


@dataclass(frozen=True)
class Tech:
    """A technology badge: display name, ring colour and SVG markup."""

    id: str
    name: str
    color: str
    svg: str


def load_techs(ids: list[str]) -> list[Tech]:
    """Resolve technology ids to names, colours and SVG logos used by the site."""
    icons_source: str = ICONS_FILE.read_text(encoding="utf-8")
    techs_source: str = TECHS_FILE.read_text(encoding="utf-8")
    imports: dict[str, str] = dict(re.findall(r'import (\w+) from "((?:devicon|simple-icons)/[^"?]+)(?:\?raw)?";', icons_source))
    entries: dict[str, str] = {}
    for key, value in re.findall(r"^\s+(\w+)(?:: (.+?))?,$", icons_source.split("const ICONS")[1].split("};")[0], re.MULTILINE):
        entries[key] = value or key
    techs: list[Tech] = []
    for tech_id in ids:
        record: re.Match[str] | None = re.search(rf'\{{ id: "{tech_id}", name: "([^"]+)", kind: "\w+", color: "(#[0-9a-fA-F]{{6}})"', techs_source)
        if record is None or tech_id not in entries:
            raise SystemExit(f"Unknown technology or missing logo: {tech_id}")
        entry: str = entries[tech_id]
        tint: re.Match[str] | None = re.match(r'tint\((\w+), "(#[0-9a-fA-F]{6})"\)', entry)
        variable: str = tint.group(1) if tint else entry
        svg: str = (NODE_MODULES / imports[variable]).read_text(encoding="utf-8")
        if tint:
            svg = svg.replace("<svg ", f'<svg fill="{tint.group(2)}" ', 1)
        techs.append(Tech(tech_id, record.group(1), record.group(2), svg))
    return techs


def render_badges(techs: list[Tech]) -> Image.Image:
    """Rasterise the badge row (light disc, coloured ring, logo) with Chromium."""
    scale: int = 3
    size: int = BADGE_SIZE * scale
    badges: str = "".join(
        f'<div class="badge" style="border-color:{tech.color}"><img src="data:image/svg+xml;charset=utf-8,{_encode(tech.svg)}"></div>'
        for tech in techs
    )
    html: str = f"""<html><body style="margin:0;background:transparent">
<div id="row" style="display:inline-flex;gap:{BADGE_GAP * scale}px;padding:2px">{badges}</div>
<style>
.badge {{ width:{size}px; height:{size}px; box-sizing:border-box; border-radius:50%; border:{max(2, size // 40)}px solid;
  background: radial-gradient(circle at 40% 35%, #fffaf1, #d9d2c4); display:grid; place-items:center; }}
.badge img {{ width:58%; height:58%; object-fit:contain; }}
</style></body></html>"""
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch()
        page = browser.new_page()
        page.set_content(html)
        page.wait_for_load_state("networkidle")
        png: bytes = page.locator("#row").screenshot(omit_background=True)
        browser.close()
    row: Image.Image = Image.open(io.BytesIO(png)).convert("RGBA")
    return row.resize((row.width // scale, row.height // scale), Image.LANCZOS)


def _encode(svg: str) -> str:
    """Percent-encode an SVG for a data URL."""
    return quote(svg)


def _font(name: str, size: int) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    """Load a Windows font, falling back to Pillow's default elsewhere."""
    path: Path = FONTS / name
    return ImageFont.truetype(str(path), size) if path.exists() else ImageFont.load_default(size)


def draw_background() -> Image.Image:
    """Draw the starfield and the golden spiral galaxy, shaded towards the text."""
    rng: random.Random = random.Random(7)
    glow: Image.Image = Image.new("RGB", (WIDTH, HEIGHT), (0, 0, 0))
    draw_glow: ImageDraw.ImageDraw = ImageDraw.Draw(glow)
    for _ in range(1400):
        x, y = rng.uniform(0, WIDTH), rng.uniform(0, HEIGHT)
        brightness: int = int(rng.uniform(60, 220))
        radius: float = rng.choice([0.6, 0.8, 1.0, 1.4])
        draw_glow.ellipse((x - radius, y - radius, x + radius, y + radius), fill=(brightness, brightness, min(255, brightness + 20)))

    cx, cy, galaxy_radius, tilt = 930.0, 330.0, 260.0, 0.42
    for index in range(9000):
        distance: float = math.pow(rng.random(), 0.62) * galaxy_radius
        arm: int = index % 4
        theta: float = distance / galaxy_radius * 3.1 + arm * math.pi / 2 + (rng.random() - 0.5) * 0.95 * (distance / galaxy_radius + 0.18)
        x = cx + math.cos(theta) * distance
        y = cy + math.sin(theta) * distance * tilt
        core: float = 1 - distance / galaxy_radius
        hue: float = (46 + (rng.random() - 0.5) * 36) / 360
        red, green, blue = colorsys.hls_to_rgb(hue, 0.55 + core * 0.3, 0.85 - core * 0.45)
        dot: float = 0.5 + rng.random() * 0.7
        draw_glow.ellipse((x - dot, y - dot, x + dot, y + dot), fill=(int(red * 150), int(green * 150), int(blue * 150)))

    core_layer: Image.Image = Image.new("RGB", (WIDTH, HEIGHT), (0, 0, 0))
    ImageDraw.Draw(core_layer).ellipse((cx - 70, cy - 34, cx + 70, cy + 34), fill=(255, 236, 190))
    core_layer = core_layer.filter(ImageFilter.GaussianBlur(40))
    bloom: Image.Image = Image.eval(glow.filter(ImageFilter.GaussianBlur(4)), lambda value: int(value * 0.6))
    composed: Image.Image = ImageChops.add(ImageChops.add(glow, bloom), core_layer)

    shade: Image.Image = Image.new("L", (WIDTH, HEIGHT), 0)
    shade_draw: ImageDraw.ImageDraw = ImageDraw.Draw(shade)
    for x in range(WIDTH):
        shade_draw.line((x, 0, x, HEIGHT), fill=int(max(0, 210 - x * 0.32)))
    return Image.composite(Image.new("RGB", (WIDTH, HEIGHT), (0, 0, 0)), composed, shade)


def compose(background: Image.Image, language: str, techs: list[Tech], badges: Image.Image) -> Image.Image:
    """Write the title block and paste the badge row in the bottom-right corner."""
    image: Image.Image = background.copy()
    draw: ImageDraw.ImageDraw = ImageDraw.Draw(image)
    muted: tuple[int, int, int] = (178, 171, 157)
    draw.text((80, 150), TAGLINES[language], font=_font("georgiai.ttf", 30), fill=muted)
    draw.text((74, 200), " ".join("ANDRÉS"), font=_font("segoeuil.ttf", 104), fill=(241, 235, 224))
    draw.text((82, 330), "  ".join("ZERIK"), font=_font("segoeuisl.ttf", 34), fill=(255, 179, 107))
    small = _font("segoeuisl.ttf", 22)
    draw.text((82, 420), "FULL STACK DEVELOPER · COLOMBIA", font=small, fill=muted)
    draw.text((82, 452), " · ".join(tech.name for tech in techs), font=small, fill=muted)
    draw.line((82, 520, 140, 520), fill=(255, 179, 107), width=2)
    draw.text((156, 507), "zerikapi.site", font=small, fill=(241, 235, 224))

    faded: Image.Image = badges.copy()
    faded.putalpha(badges.getchannel("A").point(lambda value: int(value * 0.88)))
    image.paste(faded, (WIDTH - faded.width - 56, HEIGHT - faded.height - 48), faded)
    return image


def ask_images() -> list[str]:
    """Ask on the terminal which images to generate."""
    keys: list[str] = list(PREVIEWS)
    print("Which images do you want to generate?")
    for number, key in enumerate(keys, start=1):
        print(f"  {number}. {key:<10} {PREVIEWS[key].description} -> {PREVIEWS[key].path.relative_to(ROOT)}")
    answer: str = input("Numbers separated by commas, or 'all' [all]: ").strip().lower()
    if answer in ("", "all"):
        return keys
    chosen: list[str] = []
    for part in answer.split(","):
        part = part.strip()
        if not part.isdigit() or not 1 <= int(part) <= len(keys):
            raise SystemExit(f"Invalid choice: {part}")
        chosen.append(keys[int(part) - 1])
    return chosen


def parse_args() -> argparse.Namespace:
    """Read the command-line options."""
    parser = argparse.ArgumentParser(description="Generate the portfolio's social preview images.")
    parser.add_argument("--images", nargs="+", choices=list(PREVIEWS), help="images to generate; asks when omitted")
    parser.add_argument("--stack", nargs="+", default=list(DEFAULT_STACK), help=f"technology ids from src/data/techs.ts (max {MAX_STACK})")
    return parser.parse_args()


def main() -> None:
    """Generate the requested previews."""
    args: argparse.Namespace = parse_args()
    if len(args.stack) > MAX_STACK:
        raise SystemExit(f"Use at most {MAX_STACK} technologies, got {len(args.stack)}")
    images: list[str] = args.images or (ask_images() if sys.stdin.isatty() else list(PREVIEWS))
    techs: list[Tech] = load_techs(args.stack)
    badges: Image.Image = render_badges(techs)
    background: Image.Image = draw_background()
    for key in dict.fromkeys(images):
        preview: Preview = PREVIEWS[key]
        compose(background, preview.language, techs, badges).save(preview.path, "PNG", optimize=True)
        print(f"Wrote {preview.path.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
