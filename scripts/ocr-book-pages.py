#!/usr/bin/env python3
"""Generalized OCR refresh for book.json files.

Reads the `pages[]` array in each targeted book.json, re-runs OCR on the image
at each `imagePath`, and rewrites only the `sentences` + `uniqueChars` fields.
Preserves id/title/series/level/pageCount/coverImage and each page's
pageIndex/imagePath untouched.

Usage:
    python scripts/ocr-book-pages.py BOOK_ID [BOOK_ID ...]
    python scripts/ocr-book-pages.py --series wohui
    python scripts/ocr-book-pages.py --series wohui --dry-run
    python scripts/ocr-book-pages.py --series wohui --report audit/wohui.md

Requires:
    - rapidocr_onnxruntime, pypinyin, Pillow
    - anthropic (optional, only for vision fallback)
    - ANTHROPIC_API_KEY env var (optional, enables vision fallback)
"""

from __future__ import annotations

import argparse
import base64
import hashlib
import json
import os
import re
import sys
from collections import OrderedDict
from pathlib import Path
from typing import Optional

from PIL import Image
from pypinyin import Style, pinyin
from rapidocr_onnxruntime import RapidOCR


ROOT = Path(__file__).resolve().parent.parent
BOOKS_DIR = ROOT / "public" / "books"
CACHE_DIR = ROOT / "scripts" / ".ocr-cache"
CACHE_DIR.mkdir(exist_ok=True)

CJK_PUNCT = "，。！？；：、“”‘’（）《》…·"
PUNCTUATION = set(CJK_PUNCT + ",.!?;:() ")
HAN_RE = re.compile(r"[\u4e00-\u9fff]")
ASCII_ONLY_RE = re.compile(r"^[A-Za-z0-9]+$")
PAGE_NUM_RE = re.compile(r"^\d{1,3}$")
SENTENCE_PUNCT_RE = re.compile(r"[，。！？；：“”]")
SENTENCE_SPLIT_RE = re.compile(r"[^。！？!?]+[。！？!?]?")
GENERIC_NOISE = ("阅读思维导图", "本册学习字", "ISBN", "出版社", "著作权")

OCR_ENGINE: Optional[RapidOCR] = None
CLAUDE_CLIENT = None


def get_ocr() -> RapidOCR:
    global OCR_ENGINE
    if OCR_ENGINE is None:
        OCR_ENGINE = RapidOCR()
    return OCR_ENGINE


def normalize_text(text: str) -> str:
    text = text.strip()
    text = text.replace("|", "")
    text = re.sub(r"\s+", "", text)
    text = text.replace("‘", "“").replace("’", "”")
    return text


def is_useful_line(text: str, meta: dict) -> bool:
    if not text:
        return False
    if PAGE_NUM_RE.match(text):
        return False
    if ASCII_ONLY_RE.match(text):
        return False
    if not HAN_RE.search(text):
        return False

    series = meta.get("series") or ""
    title = meta.get("title") or ""
    level = meta.get("level") or ""
    if series and series in text:
        return False
    if title and (text == title or text.endswith(title)):
        return False
    if level and text == level:
        return False
    for n in GENERIC_NOISE:
        if n in text:
            return False

    if len(text) > 40 and not SENTENCE_PUNCT_RE.search(text):
        return False
    return True


def rapid_ocr_page(image_path: Path, meta: dict) -> str:
    width, height = Image.open(image_path).size
    result, _ = get_ocr()(str(image_path))
    if not result:
        return ""

    items = []
    for box, text, score in result:
        if score < 0.82:
            continue
        clean = normalize_text(text)
        if not is_useful_line(clean, meta):
            continue
        xs = [p[0] for p in box]
        ys = [p[1] for p in box]
        bh = max(ys) - min(ys)
        if bh < 0.01 * height:
            continue  # drop near-invisible text (page numbers etc.)
        items.append({
            "y_top": float(min(ys)),
            "y_bot": float(max(ys)),
            "y_mid": float((min(ys) + max(ys)) / 2),
            "x": float(min(xs)),
            "h": float(bh),
            "text": clean,
        })

    if not items:
        return ""

    # Row-based grouping: separate normal story text from rebus/icon labels.
    # In the Disney "我会自己读" books, some words are printed as pictures with a
    # small text label underneath. OCR sees only the label's lower y position,
    # so plain top-to-bottom sorting moves the word after the text beside it.
    # Use the page's largest detected text height as the local story-text
    # reference instead of a fixed page-height cutoff.
    if meta.get("series") == "我会自己读" and meta.get("level") == "第1级":
        tallest_h = max(it["h"] for it in items)
        label_threshold_h = min(
            max(0.035 * height, 0.78 * tallest_h),
            0.052 * height,
        )
    else:
        label_threshold_h = 0.025 * height
    main_items = [it for it in items if it["h"] >= label_threshold_h]
    label_items = [it for it in items if it["h"] < label_threshold_h]

    if not main_items:
        main_items, label_items = label_items, []

    main_items.sort(key=lambda it: it["y_mid"])
    sorted_h = sorted(m["h"] for m in main_items)
    median_h = sorted_h[len(sorted_h) // 2] or 1.0
    tolerance = 0.5 * (1.3 * median_h)

    rows: list[list[dict]] = []
    for it in main_items:
        if rows and (it["y_mid"] - max(m["y_mid"] for m in rows[-1])) <= tolerance:
            rows[-1].append(it)
        else:
            rows.append([it])

    for label in label_items:
        best_row = None
        best_score = float("inf")
        for row in rows:
            row_top = min(m["y_top"] for m in row)
            row_bot = max(m["y_bot"] for m in row)
            # Rebus labels sit under the picture they represent. The top of
            # the label is a better row anchor than full bbox overlap, because
            # the lower edge often overlaps the next printed line.
            if row_top <= label["y_top"] <= row_bot:
                score = 0.0
            elif label["y_top"] > row_bot:
                score = label["y_top"] - row_bot
            else:
                score = row_top - label["y_top"]
            if score < best_score:
                best_score = score
                best_row = row
        if best_row is not None:
            best_row.append(label)

    for row in rows:
        row.sort(key=lambda m: m["x"])

    out: list[str] = []
    prev = ""
    for row in rows:
        for m in row:
            if m["text"] == prev:
                continue  # only drop immediate adjacent duplicates
            out.append(m["text"])
            prev = m["text"]
    return "".join(out)


def needs_fallback(text: str) -> bool:
    if not text:
        return True
    hans = HAN_RE.findall(text)
    if len(hans) < 3:
        return True
    if len(hans) / max(1, len(text)) < 0.5:
        return True
    return False


def claude_ocr_page(image_path: Path) -> Optional[str]:
    """Call Claude vision. Returns None if unavailable; '' is a valid 'no text' result."""
    if not os.environ.get("ANTHROPIC_API_KEY"):
        return None
    image_bytes = image_path.read_bytes()
    sha = hashlib.sha256(image_bytes).hexdigest()
    cache_file = CACHE_DIR / f"{sha}.txt"
    if cache_file.exists():
        return cache_file.read_text(encoding="utf-8")

    try:
        import anthropic
    except ImportError:
        return None

    global CLAUDE_CLIENT
    if CLAUDE_CLIENT is None:
        CLAUDE_CLIENT = anthropic.Anthropic()

    b64 = base64.b64encode(image_bytes).decode("ascii")
    msg = CLAUDE_CLIENT.messages.create(
        model="claude-opus-4-7",
        max_tokens=1024,
        messages=[{
            "role": "user",
            "content": [
                {
                    "type": "image",
                    "source": {"type": "base64", "media_type": "image/jpeg", "data": b64},
                },
                {
                    "type": "text",
                    "text": (
                        "这是一本中文儿童绘本的一页。只输出页面主要故事正文的汉字文本，"
                        "按阅读顺序连成一行，保留原有标点（，。！？）。"
                        "如果正文中用图片或图标代替某个词，请按阅读顺序输出图下标签。"
                        "不要输出页码、书名、作者或非正文装饰小字。"
                        "无正文则输出空字符串。直接输出文本，不要任何额外说明或引号。"
                    ),
                },
            ],
        }],
    )
    text_parts = [b.text for b in msg.content if getattr(b, "type", None) == "text"]
    text = normalize_text("".join(text_parts))
    cache_file.write_text(text, encoding="utf-8")
    return text


def split_sentences(text: str) -> list[str]:
    if not text:
        return []
    return [p.strip() for p in SENTENCE_SPLIT_RE.findall(text) if p.strip()]


def text_to_words(sentence: str) -> list[dict[str, str]]:
    han_chars = [c for c in sentence if HAN_RE.match(c)]
    han_pinyin: list[str] = []
    if han_chars:
        values = pinyin("".join(han_chars), style=Style.TONE, heteronym=False)
        han_pinyin = [v[0] if v else "" for v in values]

    words: list[dict[str, str]] = []
    idx = 0
    for c in sentence:
        if HAN_RE.match(c):
            py = han_pinyin[idx] if idx < len(han_pinyin) else ""
            idx += 1
            words.append({"char": c, "pinyin": py})
        else:
            words.append({"char": c, "pinyin": ""})
    return words


def decode_sentences(sentences: list) -> str:
    out: list[str] = []
    for s in sentences or []:
        for w in s.get("words") or []:
            out.append(w.get("char", ""))
    return "".join(out)


def resolve_targets(book_ids: list[str], series: Optional[str]) -> list[str]:
    ids = list(book_ids)
    if series:
        for d in sorted(BOOKS_DIR.iterdir()):
            if d.is_dir() and d.name.startswith(f"{series}-") and d.name not in ids:
                ids.append(d.name)
    return ids


def process_book(book_id: str, *, dry_run: bool, fallback: str, force: bool) -> dict:
    book_dir = BOOKS_DIR / book_id
    book_json_path = book_dir / "book.json"
    if not book_json_path.exists():
        raise FileNotFoundError(book_json_path)

    with open(book_json_path, "r", encoding="utf-8") as f:
        book = json.load(f)

    meta = {
        "title": book.get("title"),
        "series": book.get("series"),
        "level": book.get("level"),
    }
    meta_path = book_dir / "meta.json"
    if meta_path.exists():
        with open(meta_path, "r", encoding="utf-8") as f:
            meta_file = json.load(f)
        for k in ("title", "series", "level"):
            meta[k] = meta.get(k) or meta_file.get(k)

    diff_rows: list[dict] = []
    new_pages: list[dict] = []
    unique: "OrderedDict[str, bool]" = OrderedDict()
    fallback_hits = 0

    for page in book.get("pages", []):
        rel = page["imagePath"].lstrip("/")
        image_path = ROOT / "public" / rel
        if not image_path.exists():
            print(f"  WARN missing image: {image_path}", file=sys.stderr)
            text = ""
        else:
            text = rapid_ocr_page(image_path, meta)
            if fallback == "claude" and needs_fallback(text):
                claude_text = claude_ocr_page(image_path)
                if claude_text is None:
                    pass  # no key / SDK — keep local result
                elif claude_text:
                    text = claude_text
                    fallback_hits += 1

        sentences = [{"words": text_to_words(s)} for s in split_sentences(text)]
        new_page = {**page, "sentences": sentences}
        new_pages.append(new_page)

        for c in text:
            if c in PUNCTUATION or not HAN_RE.match(c):
                continue
            if c not in unique:
                unique[c] = True

        diff_rows.append({
            "pageIndex": page["pageIndex"],
            "imagePath": page["imagePath"],
            "old": decode_sentences(page.get("sentences", [])),
            "new": text,
        })

    result = {
        "book_id": book_id,
        "pages_changed": sum(1 for r in diff_rows if r["old"] != r["new"]),
        "pages_total": len(diff_rows),
        "fallback_hits": fallback_hits,
        "diff_rows": diff_rows,
    }

    if dry_run:
        return result

    bak_path = book_dir / "book.json.bak"
    if force or not bak_path.exists():
        bak_path.write_text(book_json_path.read_text(encoding="utf-8"), encoding="utf-8")

    book["pages"] = new_pages
    book["uniqueChars"] = list(unique.keys())
    with open(book_json_path, "w", encoding="utf-8") as f:
        json.dump(book, f, ensure_ascii=False, indent=2)
        f.write("\n")
    return result


def print_diff(result: dict) -> None:
    print(
        f"=== {result['book_id']} "
        f"({result['pages_changed']}/{result['pages_total']} changed, "
        f"{result['fallback_hits']} claude) ==="
    )
    for r in result["diff_rows"]:
        mark = "≠" if r["old"] != r["new"] else "="
        print(f"  p{r['pageIndex']:>2} {mark} {r['imagePath'].split('/')[-1]}")
        print(f"    OLD: {(r['old'][:110] or '(empty)')}")
        print(f"    NEW: {(r['new'][:110] or '(empty)')}")


def write_report(results: list[dict], report_path: Path) -> None:
    report_path.parent.mkdir(parents=True, exist_ok=True)
    with open(report_path, "w", encoding="utf-8") as f:
        f.write("# OCR Audit Report\n\n")
        f.write(f"{len(results)} book(s) processed.\n\n")
        for r in results:
            f.write(f"## {r['book_id']}\n\n")
            f.write(
                f"Pages changed: {r['pages_changed']}/{r['pages_total']} — "
                f"Claude fallback hits: {r['fallback_hits']}\n\n"
            )
            f.write("| page | image | old first sentence | new first sentence | changed |\n")
            f.write("|---|---|---|---|---|\n")
            for row in r["diff_rows"]:
                old = (row["old"][:80] or "—").replace("|", "\\|").replace("\n", " ")
                new = (row["new"][:80] or "—").replace("|", "\\|").replace("\n", " ")
                changed = "✓" if row["old"] != row["new"] else ""
                img = row["imagePath"].split("/")[-1]
                f.write(f"| {row['pageIndex']} | `{img}` | {old} | {new} | {changed} |\n")
            f.write("\n")


def main() -> int:
    ap = argparse.ArgumentParser(description="Re-OCR text for picture book pages.")
    ap.add_argument("book_ids", nargs="*", help="Specific book IDs")
    ap.add_argument("--series", help="Prefix like 'wohui' matching all books of a series")
    ap.add_argument("--dry-run", action="store_true", help="Print diff, do not write")
    ap.add_argument("--report", help="Write markdown audit report to this path")
    ap.add_argument("--fallback", choices=["claude", "none"], default="claude")
    ap.add_argument("--force", action="store_true", help="Overwrite existing .bak files")
    args = ap.parse_args()

    targets = resolve_targets(args.book_ids, args.series)
    if not targets:
        ap.error("No books specified. Use BOOK_ID positional args or --series PREFIX.")

    print(f"Processing {len(targets)} book(s)...")
    if args.fallback == "claude" and not os.environ.get("ANTHROPIC_API_KEY"):
        print("  NOTE: ANTHROPIC_API_KEY not set — Claude fallback disabled.")

    results: list[dict] = []
    for book_id in targets:
        print(f"• {book_id}")
        try:
            result = process_book(
                book_id,
                dry_run=args.dry_run,
                fallback=args.fallback,
                force=args.force,
            )
        except Exception as e:
            print(f"  ERROR: {e}", file=sys.stderr)
            continue
        results.append(result)
        if args.dry_run:
            print_diff(result)
        else:
            print(
                f"  wrote ({result['pages_changed']}/{result['pages_total']} changed, "
                f"{result['fallback_hits']} claude)"
            )

    if args.report:
        write_report(results, Path(args.report))
        print(f"Report: {args.report}")

    return 0


if __name__ == "__main__":
    sys.exit(main())
