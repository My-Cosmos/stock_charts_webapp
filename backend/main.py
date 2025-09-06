from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
import json

app = FastAPI()

# --- CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # allow your frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Directories ---
uploads_dir = Path(__file__).parent / "uploads"
overview_dir = uploads_dir / "overview"
detailed_dir = uploads_dir / "detailed"

overview_dir.mkdir(parents=True, exist_ok=True)
detailed_dir.mkdir(parents=True, exist_ok=True)

app.mount("/uploads/overview", StaticFiles(directory=overview_dir), name="overview")
app.mount("/uploads/detailed", StaticFiles(directory=detailed_dir), name="detailed")

# --- Load metadata.json if it exists ---
metadata_file = Path(__file__).parent / "metadata.json"
if metadata_file.exists():
    with open(metadata_file, "r", encoding="utf-8") as f:
        metadata = json.load(f)
else:
    metadata = {}  # fallback if no file


@app.get("/charts/nifty")
def get_nifty_charts():
    charts = {}

    # Collect all unique dates from files
    dates = set()
    dates.update(f.stem for f in overview_dir.glob("*.png"))
    dates.update(f.stem for f in detailed_dir.glob("*.png"))
    dates.update(metadata.keys())  # also include dates only in metadata

    for date_str in sorted(dates):
        # Overview
        overview_file = overview_dir / f"{date_str}.png"
        detailed_files = list(detailed_dir.glob(f"{date_str}*.png"))

        overview_path = f"/uploads/overview/{overview_file.name}" if overview_file.exists() else None
        if not overview_path and detailed_files:
            overview_path = f"/uploads/detailed/{detailed_files[0].name}"

        charts[date_str] = {
            "overview": overview_path or metadata.get(date_str, {}).get("overview"),
            "detailed": (
                [f"/uploads/detailed/{f.name}" for f in detailed_files]
                if detailed_files else metadata.get(date_str, {}).get("detailed", [])
            ),
            "tags": metadata.get(date_str, {}).get("tags", []),
            "descriptions": metadata.get(date_str, {}).get("descriptions", []),
            "summaries": metadata.get(date_str, {}).get("summaries", [])
        }

    return charts
