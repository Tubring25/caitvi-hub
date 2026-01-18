"""
CaitVi Hub - AO3 Data ETL Pipeline

This script fetches fan fiction metadata from AO3 and transforms it
into the format expected by the CaitVi Hub database.

Usage:
    # Fetch a single work
    python etl_pipeline.py --work-id 64163587

    # Weekly Update: Fetch all works from the past 7 days
    python etl_pipeline.py --mode weekly
"""

import os
import re
import time
import argparse
import json
from dataclasses import dataclass, asdict
from datetime import datetime, timedelta
from typing import Optional

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
    status: str
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
            is_translated=False,
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

        print(f"✅ Successfully fetched: {fic.title} by {fic.author}")
        return fic
    except AO3.utils.InvalidIdError:
        print(f"❌ Invalid work ID: {work_id}")
        return None
    except Exception as e:
        print(f"❌ Error fetching work {work_id}: {e}")
        return None
    
# ============== Search & Pipeline Functions ==============
CAITVI_TAGS = [
    "Caitlyn/Vi (League of Legends)"
]

def search_works_with_paging(
    tags: list[str],
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    min_kudos: int = 0,
    page_limit: int = 1,
) -> list[int]:
    """Search AO3 works with pagination support.
    
    Args: 
        tags: List of relationship tags
        date_from:YYYY-MM-DD string
        date_to:YYYY-MM-DD string
        min_kudos: Minimum kudos count
        page_limit: Maximum number of pages to fetch

    Returns:
        List of work IDs
    """

    work_ids = []
    print(f"🔍 Searching for works with tags: {tags}")
    print(f"🔍 Date range: {date_from} to {date_to}")
    print(f"🔍 Minimum kudos: {min_kudos}")
    print(f"🔍 Page limit: {page_limit}")

    try:
        relationship_filter = tags[0] if tags else None

        search = AO3.Search(
            relationships = relationship_filter,
            kudos = AO3.utils.Constraint(min_kudos, None) if min_kudos > 0 else None,
            sort_column = "created_at",
            sort_direction = "desc"
        )

        for page in range(1, page_limit + 1):
            print(f"🔍 Searching page {page}...")
            search.page = page
            search.update()

            current_page_count = 0
            for result in search.results:
                if date_from and hasattr(result, "date_published"):
                    if str(result.date_published) < date_from:
                        return list(set(work_ids))
                    
                # Check the "F/F" category only
                if "F/F" not in (result.categories or []):
                    continue

                work_ids.append(result.id)
                current_page_count += 1

            print(f"✅ Found {current_page_count} works on page {page}")

            if current_page_count < 20:
                break

            time.sleep(5.0)
    
    except Exception as e:
        print(f"❌ Search failed: {e}")
    
    # Remove Duplicates
    unique_ids = list(set(work_ids))
    return unique_ids


def fetch_batch(work_ids: list[int], delay: float = 5.0) -> list[FicData]:
    """Fetch a batch of works with limiting rate"""
    results = []
    total = len(work_ids)

    for i, work_id in enumerate(work_ids, 1):
        print(f"🔍 Fetching [{i}/{total}]...")
        fic = fetch_work(work_id)
        if fic: 
            results.append(fic)

        if i < total:
            time.sleep(delay)
    
    return results

def run_pipeline(mode: str, output: str = None, **kwargs) -> list[FicData]:
    """ Pipeline runner for both weekly and full update."""

    print("=" * 60)
    print(f"🚀 CaitVi Hub ETL Pipeline - Mode: {mode.upper()}")
    print("=" * 60)

    work_ids = []
    
    if mode == "weekly":
        # Weekly: Past 7 days
        days = kwargs.get("days", 7)
        min_kudos = kwargs.get("min_kudos", 0)

        end_date = datetime.now()
        start_date = end_date - timedelta(days = days)

        work_ids = search_works_with_paging(
            tags = CAITVI_TAGS,
            date_from = start_date.strftime("%Y-%m-%d"),
            date_to=end_date.strftime("%Y-%m-%d"),
            min_kudos=min_kudos,
            page_limit = 5
        )
    elif mode == "full":
        # Full: No date limit but with high kudos filter and page limits
        min_kudos = kwargs.get("min_kudos", 500)
        page_limit = kwargs.get("page_limit", 20)

        work_ids = search_works_with_paging(
            tags = CAITVI_TAGS,
            min_kudos = min_kudos,
            page_limit = page_limit
        )

    if not work_ids:
        print("\n⚠️ No works found matching criteria.")
        return []

    # Fetch details for each work
    results = fetch_batch(work_ids, delay=5.0)


    # Save to output
    if output and results:
        # Create output directory if it doesn't exist
        os.makedirs(os.path.dirname(output), exist_ok=True)

        output_data = [asdict(fic) for fic in results]
        with open(output, "w", encoding="utf-8") as f:
            json.dump(output_data, f, ensure_ascii=False, indent=2)
        print(f"\n📁 Results saved to: {output}")
    
    print("=" * 60)
    print("\n✅ Pipeline completed successfully!")
    print("=" * 60)
    return results


# ============== Output Formatting ==============

def print_summary(fic: FicData) -> None:
    """Print a formatted summary of the fic."""
    print("\n" + "-" * 50)
    print(f"📖 {fic.title}")
    print(f"✍️  Author: {fic.author}")
    print(f"🔗 {fic.link}")
    print(f"📊 Rating: {fic.rating} | Status: {fic.status}")
    print(f"📈 Words: {fic.stats.words:,} | Kudos: {fic.stats.kudos:,}")
    print(f"📐 Meters: S={fic.state.spice} A={fic.state.angst} F={fic.state.fluff} P={fic.state.plot} R={fic.state.romance}")


def save_to_json(fic: FicData, output_path: str) -> None:
    """Save FicData to a JSON file with provided path"""
    data = asdict(fic)
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"📁 Results saved to: {output_path}")

def main():
    print("🚀 Staring AO3 Data Fetcher...")

    # Parsing command line arguments
    parser = argparse.ArgumentParser(
        description="CaitVi Hub AO3 ETL Pipeline",
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )

    # Operation Mode
    parser.add_argument(
        "--mode",
        type=str,
        choices=["single", "weekly", "full"],
        default="single",
        help="Run mode: 'single' for one work, 'weekly' for last 7 days, 'full' for full database update"    
    )

    # Single Work Mode
    parser.add_argument("--work-id", type=int, help="Single AO3 work ID to fetch")

    # Pipeline args
    parser.add_argument("--days", type=int, default=7, help="Days to look back (weekly mode)")
    parser.add_argument("--min-kudos", type=int, default=0, help="Minimum kudos filter")
    parser.add_argument("--pages", type=int, default=10, help="Max pages (full mode)")
    parser.add_argument("--output", type=str, help="Output JSON file path")

    args = parser.parse_args()

    if args.mode == "single":
        work_id = args.work_id or 64163587  # Default demo ID
        print(f"🚀 Fetching single work: {work_id}")
        fic = fetch_work(work_id)
        if fic:
            print_summary(fic)
            if args.output:
                save_to_json(fic, args.output)

    else:
        run_pipeline(
            mode=args.mode,
            output=args.output,
            days=args.days,
            min_kudos=args.min_kudos,
            page_limit=args.pages
        )

if __name__ == "__main__":
    main()
