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
from typing import List, Optional
from dotenv import load_dotenv

import AO3

# Load environment variables
load_dotenv()

# ============== AO3 Session Management ==============
username = os.environ.get("AO3_USERNAME")
password = os.environ.get("AO3_PASSWORD")
session = None

if username and password:
    try:
        session = AO3.Session(username, password)
        print(f"✅ Successfully logged in as {username}")
    except Exception as e:
        print(f"❌ Error logging in: {e}")
        session = None
else:
    print("❌ AO3 credentials not found. Using anonymous session.")
    session = AO3.GuestSession()

# ============== Tag Scoring Rules ==============

# Rules Dictionary:
# Keys are lowercase keywords and default to partial matches
# Values include:
# - "{metric}_add": increment or decrement score.
# - "{metric}": force set score.

TAG_RULES = {
    # --- SPICE ---
    "explicit": {"spice": 5},
    "mature": {"spice": 3},
    "smut": {"spice_add": 2},
    "porn": {"spice_add": 2},
    "sex": {"spice_add": 1},
    "sexual tension": {"spice_add": 1},
    "knotting": {"spice_add": 1},
    "alpha/beta/omega dynamics": {"spice_add": 2},
    "fade to black": {"spice": 1},
    "flirting": {"spice_add": 1, "romance_add": 1},
    "slow burn": {"spice_add": -1},
    # --- ANGST ---
    "major character death": {"angst": 5, "fluff": 1},
    "dead dove: do not eat": {"angst": 5},
    "hurt no comfort": {"angst_add": 3, "fluff": 1},
    "hurt/comfort": {"angst_add": 2, "fluff_add": 1},
    "angst": {"angst_add": 2},
    "grief": {"angst_add": 2},
    "trauma": {"angst_add": 2},
    "ptsd": {"angst_add": 2},
    "heavy angst": {"angst_add": 3},
    "canon compliant": {"angst_add": 1},
    "light angst": {"angst_add": 1},
    "happy ending": {"angst_add": -1},
    # --- FLUFF ---
    "tooth-rotting fluff": {"fluff": 5},
    "no angst": {"fluff": 5},
    "domestic": {"fluff_add": 3},
    "fluff": {"fluff_add": 2},
    "modern au": {"fluff_add": 1},
    "coffee shop": {"fluff_add": 1},
    "flower shop": {"fluff_add": 1},
    "soft caitlyn": {"fluff_add": 1, "romance_add": 1},
    "soft vi": {"fluff_add": 1, "romance_add": 1},
    "protective vi": {"fluff_add": 1},
    "jealous caitlyn": {"fluff_add": 1},
    "mutual pining": {"fluff_add": 1, "romance_add": 1},
    # --- PLOT ---
    "canon divergence": {"plot_add": 1},
    "fix-it": {"plot_add": 1, "romance_min": 4},
    "time travel": {"plot_add": 1, "romance_min": 4},
    "mystery": {"plot_add": 2},
    "case fic": {"plot_add": 2},
    "detective": {"plot_add": 2},
    "politics": {"plot_add": 2},
    "investigation": {"plot_add": 2},
    "post-canon": {"plot_add": 1},
    "pwp": {"plot": 1},
    "porn without plot": {"plot": 1},
    "chatfic": {"plot": 1},
    # --- ROMANCE ---
    "slow burn": {"romance": 5},
    "established relationship": {"romance_min": 4},
    "soulmates": {"romance_add": 1},
    "enemies to lovers": {"romance_add": 1},
    "first time": {"romance_add": 1},
    "first kiss": {"romance_add": 1},
    "confessions": {"romance_add": 1},
    "pre-canon": {"romance_add": -1},
    "friends to lovers": {"romance_add": 1},
    "friendship": {"romance": 1},
    "platonic": {"romance": 1},
}

# ============== Data Models ==============


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


# ============== Metrics Calculation ==============


def calculate_metrics(tags: list[str], rating: str, word_count: int) -> FicState:
    """Based on the Tags, Rating and Word Count, calculate the 5 basic metrics."""

    # BaseLine
    scores = {"spice": 1, "angst": 1, "fluff": 1, "plot": 1, "romance": 3}
    forced_values = {}
    min_values = {}

    # Hardcoded Rules for Spice
    if rating == "E":
        scores["spice"] = 5
    elif rating == "M":
        scores["spice"] = 3

    # Hardcoded Rules for Plot base on word count
    if word_count > 50000:
        scores["plot"] = 5
    elif word_count > 20000:
        scores["plot"] = 4
    elif word_count > 10000:
        scores["plot"] = 3
    elif word_count > 5000:
        scores["plot"] = 2

    # Process Tags
    lower_tags = [t.lower() for t in tags]

    for tag in lower_tags:
        for rule_key, rules in TAG_RULES.items():
            if rule_key not in tag:
                continue

            for action, value in rules.items():
                if action.endswith("_add"):
                    metric = action[:-4]
                    scores[metric] += value
                elif action.endswith("_min"):
                    metric = action[:-4]
                    min_values[metric] = max(min_values.get(metric, 0), value)
                else:
                    metric = action
                    if metric not in forced_values or value in (1, 5):
                        forced_values[metric] = value

    for metric, min_val in min_values.items():
        scores[metric] = max(scores[metric], min_val)

    scores.update(forced_values)

    has_comfort = any("comfort" in t for t in lower_tags)
    if scores["angst"] >= 4 and not has_comfort:
        scores["fluff"] -= 1

    for k in scores:
        scores[k] = max(1, min(5, scores[k]))

    return FicState(**scores)


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


def escape_sql(text: str) -> str:
    """Escape special characters for SQL insertion."""
    if not text:
        return ""
    return text.replace("'", "''").replace("\n", "\\n").replace("\r", "")


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
        work = AO3.Work(work_id, session=session)

        # Calculate Metrics
        mapped_rating = map_rating(work.rating)
        state_metrics = calculate_metrics(work.tags, mapped_rating, work.words or 0)

        # Build FicData object
        fic = FicData(
            id=f"{work_id}",
            title=work.title,
            author=work.authors[0].username if work.authors else "Anonymous",
            summary=clean_summary(work.summary or ""),
            rating=map_rating(work.rating),
            tags=work.tags,
            category=work.categories[0] if work.categories else "Other",
            status=map_status(work.status),
            is_translated=False,
            state=state_metrics,
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
CAITVI_TAGS = ["Caitlyn/Vi (League of Legends)"]


def parse_search_result(result) -> Optional[FicData]:
    """Parse a single AO3 search result into FicData"""

    try:
        work_id = result.id
        title = result.title or "Untitled"

        # Author
        authors = getattr(result, "authors", None)
        if authors and len(authors) > 0:
            author = (
                authors[0].username
                if hasattr(authors[0], "username")
                else str(authors[0])
            )
        else:
            author = "Anonymous"

        # Tags
        all_tags = []
        for tag_attr in ["fandoms", "characters", "relationships", "tags"]:
            tags = getattr(result, tag_attr, None)
            if tags:
                all_tags.extend(tags)

        # Stats
        words = getattr(result, "words", 0) or 0
        chapters = getattr(result, "chapters", 1) or 1
        kudos = getattr(result, "kudos", 0) or 0
        hits = getattr(result, "hits", 0) or 0
        comments = getattr(result, "comments", 0) or 0
        bookmarks = getattr(result, "bookmarks", 0) or 0

        # Rating and status
        raw_rating = getattr(result, "rating", "Not Rated") or "Not Rated"
        mapped_rating = map_rating(raw_rating)

        raw_status = getattr(result, "status", None)
        status = map_status(raw_status) if raw_status else "ongoing"

        # Category
        categories = getattr(result, "categories", None) or []
        category = categories[0] if categories else "Other"

        # Summary
        raw_summary = getattr(result, "summary", "") or ""
        summary = clean_summary(raw_summary)

        # URL
        url = f"https://archiveofourown.org/works/{work_id}"

        # Calculate metrics
        state_metrics = calculate_metrics(all_tags, mapped_rating, words)

        fic = FicData(
            id=str(work_id),
            title=title,
            author=author,
            link=url,
            summary=summary,
            rating=mapped_rating,
            category=category,
            status=status,
            is_translated=False,
            tags=all_tags,
            stats=FicStats(
                words=words,
                chapters=chapters,
                kudos=kudos,
                hits=hits,
                comments=comments,
                bookmarks=bookmarks,
            ),
            state=state_metrics,
            quote="",
        )

        return fic

    except Exception as e:
        print(f"⚠️ Failed to parse result: {e}")
        return None


def search_and_collect(
    tags: list[str],
    min_kudos: int = 0,
    max_kudos: int = None,
    page_limit: int = 1,
    days_back: int = 0,
    sort_by: str = "revised_at",
) -> list[FicData]:
    """Search AO3 works and directly collect FicData from search results.

    Args:
        tags: List of relationship tags
        min_kudos: Minimum kudos count
        max_kudos: Maximum kudos count
        page_limit: Maximum number of pages to fetch
        days_back: Number of days to look back (0 means no limit)
        sort_by: Sort column ("revised_at" for weekly, "kudos_count" for full)

    Returns:
        List of FicData objects
    """

    results = []
    seen_ids = set()

    print(f"🔍 Searching for works with tags: {tags}")
    print(f"🔍 Days back: {days_back if days_back > 0 else 'Unlimited'}")
    print(f"🔍 Kudos range: {min_kudos} - {max_kudos if max_kudos else 'Unlimited'}")
    print(f"🔍 Page limit: {page_limit}")
    print(f"🔍 Sort by: {sort_by}")

    try:
        relationship_filter = tags[0] if tags else None

        revised_at_filter = ""
        if days_back > 0:
            revised_at_filter = f"< {days_back} days"

        search = AO3.Search(
            any_field="'F/F' -'M/M' -'F/M'",
            relationships=relationship_filter,
            kudos=AO3.utils.Constraint(min_kudos, max_kudos)
            if min_kudos or max_kudos
            else None,
            revised_at=revised_at_filter,
            sort_column=sort_by,
            sort_direction="desc",
            session=session,
        )

        for page in range(1, page_limit + 1):
            print(f"🔍 Searching page {page}...")

            max_retries = 3
            retry_count = 0
            page_success = False

            while retry_count < max_retries:
                try:
                    search.page = page
                    search.update()

                    if not search.results and page == 1:
                        page_success = True
                        break

                    page_success = True
                    break

                except Exception as e:
                    print(
                        f"⚠️ Page {page} fetch failed (attempt {retry_count}/{max_retries}): {e}"
                    )
                    retry_count += 1

                    if retry_count < max_retries:
                        time.sleep(30 * (2 ** (retry_count - 1)))
                    else:
                        print(
                            f"❌ Failed to fetch page {page} after {max_retries} retries: {e}"
                        )

            if not page_success:
                break

            page_count = 0
            for result in search.results:
                if result.id in seen_ids:
                    continue
                seen_ids.add(result.id)

                fic = parse_search_result(result)
                if fic:
                    results.append(fic)
                    page_count += 1

            print(
                f"✅ Collected {page_count} works from page {page} (Total: {len(results)})"
            )

            # Stop if this page has fewer than 20 results (last page)
            if len(search.results) < 20:
                print(f"📄 Last page reached (only {len(search.results)} results)")
                break

            time.sleep(5.0)

    except Exception as e:
        print(f"❌ Search failed: {e}")

    return results


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


def generate_sql_file(fics: list[FicData], output_path: str) -> None:
    """Generate INSERT SQL for Cloudflare D1"""

    print(f"⚙️ Generating SQL file: {output_path}...")

    # Create directory if path contains subdirectories
    output_dir = os.path.dirname(output_path)
    if output_dir:
        os.makedirs(output_dir, exist_ok=True)

    with open(output_path, "w", encoding="utf-8") as f:
        f.write(f"-- Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        f.write("-- Mode: Upsert (INSERT OR REPLACE)\n\n")

        for fic in fics:
            category_str = (
                fic.category[0]
                if isinstance(fic.category, list)
                else (fic.category or "Other")
            )

            tags_json = json.dumps(fic.tags, ensure_ascii=False).replace("'", "''")

            sql = f"""INSERT OR REPLACE INTO fics (
                id, title, author, link, summary, 
                rating, category, status, is_translated, 
                words, chapters, kudos, hits, comments, bookmarks,
                tags_json, quote,
                base_spice, base_angst, base_fluff, base_plot, base_romance,
                created_at, updated_at
            ) VALUES (
                '{fic.id}', 
                '{escape_sql(fic.title)}', 
                '{escape_sql(fic.author)}', 
                '{escape_sql(fic.link)}', 
                '{escape_sql(fic.summary)}', 
                '{fic.rating}', 
                '{fic.category}', 
                '{fic.status}', 
                {1 if fic.is_translated else 0}, 
                {fic.stats.words}, 
                {fic.stats.chapters}, 
                {fic.stats.kudos}, 
                {fic.stats.hits}, 
                {fic.stats.comments}, 
                {fic.stats.bookmarks}, 
                '{tags_json}', 
                '{escape_sql(fic.quote)}', 
                {fic.state.spice}, 
                {fic.state.angst}, 
                {fic.state.fluff}, 
                {fic.state.plot}, 
                {fic.state.romance}, 
                CURRENT_TIMESTAMP, 
                CURRENT_TIMESTAMP
            );
            """
            f.write(sql + "\n")

    print(f"✅ SQL file generated: {output_path}")


def run_pipeline(
    mode: str, output: str = None, output_format: str = "json", **kwargs
) -> list[FicData]:
    """Pipeline runner for both weekly and full update."""

    print("=" * 60)
    print(f"🚀 CaitVi Hub ETL Pipeline - Mode: {mode.upper()}")
    print("=" * 60)

    results = []

    if mode == "weekly":
        # Weekly: Past N days, sort by revised_at
        days = kwargs.get("days", 7)
        min_kudos = kwargs.get("min_kudos", 0)
        max_kudos = kwargs.get("max_kudos", None)

        results = search_and_collect(
            tags=CAITVI_TAGS,
            days_back=days,
            min_kudos=min_kudos,
            max_kudos=max_kudos,
            page_limit=5,
            sort_by="revised_at",
        )
    elif mode == "full":
        # Full: No date limit, sort by kudos_count to get high quality works
        min_kudos = kwargs.get("min_kudos", 500)
        max_kudos = kwargs.get("max_kudos", None)
        page_limit = kwargs.get("page_limit", 20)

        results = search_and_collect(
            tags=CAITVI_TAGS,
            min_kudos=min_kudos,
            max_kudos=max_kudos,
            page_limit=page_limit,
            sort_by="kudos_count",
        )

    if not results:
        print("\n⚠️ No works found matching criteria.")
        return []

    # Save to output
    if output and results:
        if output_format == "sql":
            generate_sql_file(results, output)
        else:
            # Create output directory if it doesn't exist
            output_dir = os.path.dirname(output)
            if output_dir:
                os.makedirs(output_dir, exist_ok=True)

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
    print(
        f"📐 Meters: S={fic.state.spice} A={fic.state.angst} F={fic.state.fluff} P={fic.state.plot} R={fic.state.romance}"
    )


def save_to_json(fic: FicData, output_path: str) -> None:
    """Save FicData to a JSON file with provided path"""
    output_dir = os.path.dirname(output_path)
    if output_dir:
        os.makedirs(output_dir, exist_ok=True)
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
        help="Run mode: 'single' for one work, 'weekly' for last 7 days, 'full' for full database update",
    )

    # Single Work Mode
    parser.add_argument("--work-id", type=int, help="Single AO3 work ID to fetch")

    # Pipeline args
    parser.add_argument(
        "--days", type=int, default=7, help="Days to look back (weekly mode)"
    )
    parser.add_argument("--min-kudos", type=int, default=0, help="Minimum kudos filter")
    parser.add_argument(
        "--max-kudos", type=int, default=None, help="Maximum kudos filter"
    )
    parser.add_argument("--pages", type=int, default=10, help="Max pages (full mode)")
    parser.add_argument("--output", type=str, help="Output JSON file path")

    # Format
    parser.add_argument(
        "--format",
        default="sql",
        choices=["json", "sql"],
        help="Output format: json or sql",
    )

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
            output_format=args.format,
            days=args.days,
            min_kudos=args.min_kudos,
            max_kudos=args.max_kudos,
            page_limit=args.pages,
        )


if __name__ == "__main__":
    main()
