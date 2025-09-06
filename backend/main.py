from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
import os
import json

app = FastAPI()

# --- CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # allow frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Static folders ---
uploads_dir = Path(__file__).parent / "uploads"
symbols = ["nifty", "sensex", "banknifty"]

# Make sure folders exist
for sym in symbols:
    (uploads_dir / sym / "overview").mkdir(parents=True, exist_ok=True)
    (uploads_dir / sym / "detailed").mkdir(parents=True, exist_ok=True)
    # Optional: create a metadata JSON if not exists
    metadata_file = uploads_dir / f"{sym}_metadata.json"
    if not metadata_file.exists():
        with open(metadata_file, "w") as f:
            json.dump({}, f)

# Mount static files
for sym in symbols:
    app.mount(f"/uploads/{sym}/overview", StaticFiles(directory=uploads_dir / sym / "overview"), name=f"{sym}_overview")
    app.mount(f"/uploads/{sym}/detailed", StaticFiles(directory=uploads_dir / sym / "detailed"), name=f"{sym}_detailed")


def load_metadata(symbol):
    metadata_file = uploads_dir / f"{symbol}_metadata.json"
    if metadata_file.exists():
        with open(metadata_file, "r") as f:
            return json.load(f)
    return {}

def build_charts_for_symbol(symbol):
    overview_dir = uploads_dir / symbol / "overview"
    detailed_dir = uploads_dir / symbol / "detailed"
    metadata = load_metadata(symbol)
    
    charts = {}
    dates = set()
    if overview_dir.exists():
        dates.update(f.stem for f in overview_dir.glob("*.png"))
    if detailed_dir.exists():
        dates.update(f.stem for f in detailed_dir.glob("*.png"))

    for date_str in sorted(dates, reverse=True):  # newest first
        overview_file = overview_dir / f"{date_str}.png"
        detailed_files = list(detailed_dir.glob(f"{date_str}.png"))

        overview_path = f"/uploads/{symbol}/overview/{date_str}.png" if overview_file.exists() else None
        if not overview_path and detailed_files:
            overview_path = f"/uploads/{symbol}/detailed/{detailed_files[0].name}"

        charts[date_str] = {
            "overview": overview_path,
            "detailed": [f"/uploads/{symbol}/detailed/{f.name}" for f in detailed_files],
            "tags": metadata.get(date_str, {}).get("tags", []),
            "descriptions": metadata.get(date_str, {}).get("descriptions", []),
            "summaries": metadata.get(date_str, {}).get("summaries", [])
        }
    return charts


@app.get("/charts/{symbol}")
def get_charts(symbol: str):
    if symbol.lower() == "all":
        # Build combined JSON for all symbols
        all_charts = {}
        for sym in symbols:
            all_charts[sym] = build_charts_for_symbol(sym)
        return all_charts
    elif symbol.lower() in symbols:
        return build_charts_for_symbol(symbol.lower())
    else:
        return {"error": "Invalid symbol"}
