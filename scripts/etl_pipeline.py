"""
CaitVi Hub - AO3 Data ETL Pipeline

This script fetches fan fiction metadata from AO3 and transforms it
into the format expected by the CaitVi Hub database.

Usage:
    python etl_pipeline.py --work-id 64163587
    python etl_pipeline.py --work-ids 64163587,62644312
"""

import re
from dataclasses import dataclass
from typing import Optional
import argparse
import json

import AO3

# =============================================================================
# Data Models
# =============================================================================


@dataclass
class FicStats:
    """AO3 statistics for a fic."""

    words: int
    chapters: int
    kudos: int
    hits: int
    comments: int
    bookmarks: int


@dataclass
class FicState:
    """Rating meters for a fic."""

    spice: int
    angst: int
    fluff: int
    plot: int
    romance: int


@dataclass
class FicData:
    """Complete fic data matching the database schema."""

    id: str
    title: str
    author: str
    link: str
    summary: str
    rating: str
    category: str
    status: bool
    is_translated: bool
    tags: list[str]
    stats: FicStats
    state: FicState
    quote: str


# ========== Mapping Functions ==========
def map_rating(ao3_rating: str) -> str:
    """Map AO3 rating string to single letter."""
    rating_map = {
        "General Audiences": "G",
        "Teen And Up Audiences": "T",
        "Mature": "M",
        "Explicit": "E",
        "Not Rated": "T",
    }
    return rating_map.get(ao3_rating, "T")


def map_status(ao3_status: str) -> str:
    """Map AO3 status to our schema."""
    if ao3_status and "complete" in ao3_status.lower():
        return "completed"
    return "ongoing"


def clean_summary(summary: str) -> str:
    """Clean HTML tags"""
    return re.sub(r"<[^>]+>", "", summary).strip()


def extract_all_tags(work) -> list[str]:
    """Extract all tags"""
    all_tags = []
    if hasattr(work, "fandoms"):
        all_tags.extend(work.fandoms)
    if hasattr(work, "characters"):
        all_tags.extend(work.characters)
    if hasattr(work, "relationships"):
        all_tags.extend(work.relationships)
    if hasattr(work, "tags"):
        all_tags.extend(work.tags)
    return all_tags


# ============== AO3 Data Fetcher ==============
def fetch_work(work_id: int) -> Optional[FicData]:
    """Fetch a single work from ao3

    Args:
        work_id (int): work id

    Returns:
        Optional[FicData]: FicData object or None if fetch failed
    """
    try:
        print(f"🔍 Fetching AO3 Work ID: {work_id}...")

        # Call the AO3 API
        work = AO3.Work(work_id)

        # Extract all tags
        all_tags = extract_all_tags(work)

        # Build FicData object
        fic = FicData(
            id=f"ao3_{work_id}",
            title=work.title,
            author=work.authors[0].username if work.authors else "Anonymous",
            summary=clean_summary(work.summary or ""),
            rating=map_rating(work.rating),
            tags=all_tags,
            category="F/F" if "F/F" in (work.categories or []) else "Other",
            status=map_status(work.status),
            is_translated=check_is_translated(all_tags),
            state=FicState(spice=1, angst=1, fluff=1, plot=1, romance=1),
            stats=FicStats(
                words=work.words or 0,
                chapters=work.nchapters or 1,
                kudos=work.kudos or 0,
                hits=work.hits or 0,
                comments=work.comments or 0,
                bookmarks=work.bookmarks or 0,
            ),
            quote="",
            link=work.url,
        )

        print(f"✅ Successfully fetched: {title} by {author}")
        return fic

    except Exception as e:
        print(f"❌ Error fetching work {work_id}: {e}")
        return None

# ============== Output Formatting ==============
def save_to_json(fic: FicData, output_path: str) -> None:
    """Save FicData to a JSON file with provided path"""
    data = asdict(fic)
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"📁 Results saved to: {output_path}")

def main():
    print("🚀 Staring AO3 Data Fetcher...")

    # Parsing command line arguments
    parser = argparse.ArgumentParser(description="CaitVi Hub AO3 ETL Pipeline")
    parser.add_argument("--work-id", type=int, help="Single AO3 work ID to fetch")
    parser.add_argument("--output", type=str, help="Output JSON file path (optional)")
    args = parser.parse_args()

    # Get work ID from arguments
    work_id = args.work_id
    if not work_id:
        print("ℹ️  No work ID provided, using demo work ID: 64163587")
        work_id = 64163587
    
    # Fetch the work
    fic = fetch_work(work_id)
        print_summary(fic)

        # If output path is provided
        if args.output:
            save_to_json(fic, args.output)

    print("✅ Done!")

if __name__ == "__main__":
    main()
