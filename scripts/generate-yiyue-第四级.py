#!/usr/bin/env python3

from __future__ import annotations

import json
import re
import subprocess
from collections import OrderedDict
from pathlib import Path

from PIL import Image
from pypinyin import Style, pinyin
from rapidocr_onnxruntime import RapidOCR


ROOT = Path(__file__).resolve().parent.parent
LIBRARY_DIR = ROOT / "library" / "一阅而起" / "汉语分级阅读绘本  第四级"
BOOKS_DIR = ROOT / "public" / "books"
CATALOG_PATH = BOOKS_DIR / "catalog.json"

SERIES = "汉语分级阅读绘本"
LEVEL = "第四级"
TITLE_MAP = OrderedDict(
    [
        (1, "兔儿爷"),
        (2, "狼来了"),
        (3, "准时的一天"),
        (4, "中秋节的月亮"),
        (5, "我要当大树"),
        (6, "我有五个梦想"),
        (7, "神奇的工厂"),
        (8, "多可爱的夜晚"),
        (9, "北京的秋天"),
        (10, "夏天要走了"),
    ]
)

PAGE_START = 4
PAGE_END = 22
BODY_PAGE_COUNT = PAGE_END - PAGE_START + 1
OCR = RapidOCR()
PUNCTUATION = set("，。！？；：、“”‘’（）《》…,.!?;:() ")


def run(*args: str) -> None:
    subprocess.run(args, check=True)


def ensure_pages(book_no: int) -> Path:
    book_id = f"yiyue-第四级-{book_no:02d}"
    pages_dir = BOOKS_DIR / book_id / "pages"
    pages_dir.mkdir(parents=True, exist_ok=True)
    if (pages_dir / "page-22.jpg").exists():
        return pages_dir

    pdf_path = LIBRARY_DIR / f"{book_no}.pdf"
    run(
        "pdftoppm",
        "-jpeg",
        "-r",
        "150",
        "-scale-to",
        "1200",
        str(pdf_path),
        str(pages_dir / "page"),
    )
    return pages_dir


def normalize_text(text: str) -> str:
    text = text.strip()
    text = text.replace("|", "")
    text = re.sub(r"\s+", "", text)
    text = text.replace("‘", "“").replace("’", "”")
    return text


def is_useful_line(text: str, title: str) -> bool:
    if not text:
        return False
    if SERIES in text or title == text or text.endswith(title):
        return False
    if "本册学习字" in text or "阅读思维导图" in text or "共55字" in text:
        return False
    if "你知道吗" in text or "如果有机会" in text or "这样的神话故事" in text:
        return False
    if re.fullmatch(r"[A-Za-z0-9]+", text):
        return False
    if not re.search(r"[\u4e00-\u9fff]", text):
        return False
    if len(text) > 14 and not re.search(r"[，。！？；：“”]", text):
        return False
    return True


def keep_line_for_page(page_number: int, line: dict, width: int, height: int) -> bool:
    x = line["x"]
    y = line["y"]
    h = line["h"]

    if page_number == 4:
        return y > height * 0.35 and x < width * 0.55 and h > height * 0.03
    if page_number == 5:
        return x > width * 0.5 and y < height * 0.72 and h > height * 0.02
    if page_number == 6:
        return x < width * 0.6 and y > height * 0.45 and h > height * 0.02

    return True


def ocr_page_text(image_path: Path, title: str, page_number: int) -> str:
    width, height = Image.open(image_path).size
    result, _ = OCR(str(image_path))
    if not result:
        return ""

    lines = []
    for box, text, score in result:
        if score < 0.82:
            continue
        clean = normalize_text(text)
        if not is_useful_line(clean, title):
            continue
        xs = [point[0] for point in box]
        ys = [point[1] for point in box]
        lines.append(
            {
                "x": min(xs),
                "y": min(ys),
                "w": max(xs) - min(xs),
                "h": max(ys) - min(ys),
                "text": clean,
            }
        )

    if not lines:
        return ""

    lines = [line for line in lines if keep_line_for_page(page_number, line, width, height)]
    if not lines:
        return ""

    lines.sort(key=lambda item: (item["y"], item["x"]))

    deduped: list[str] = []
    seen = set()
    for item in lines:
        text = item["text"]
        if text in seen:
            continue
        seen.add(text)
        deduped.append(text)

    return "".join(deduped)


def split_sentences(text: str) -> list[str]:
    if not text:
        return []
    return [part.strip() for part in re.findall(r"[^。！？!?]+[。！？!?]?", text) if part.strip()]


def text_to_words(sentence: str) -> list[dict[str, str]]:
    han_chars = [char for char in sentence if re.match(r"[\u4e00-\u9fff]", char)]
    han_pinyin = []
    if han_chars:
        values = pinyin("".join(han_chars), style=Style.TONE, heteronym=False)
        han_pinyin = [item[0] if item else "" for item in values]

    words = []
    idx = 0
    for char in sentence:
        if re.match(r"[\u4e00-\u9fff]", char):
            py = han_pinyin[idx] if idx < len(han_pinyin) else ""
            idx += 1
            words.append({"char": char, "pinyin": py})
        else:
            words.append({"char": char, "pinyin": ""})
    return words


def make_book(book_no: int, title: str) -> dict:
    book_id = f"yiyue-第四级-{book_no:02d}"

    if book_no == 4 and (BOOKS_DIR / book_id / "book.json").exists():
        with open(BOOKS_DIR / book_id / "book.json", "r", encoding="utf-8") as f:
            return json.load(f)

    pages_dir = ensure_pages(book_no)
    pages = []
    unique_chars: list[str] = []
    seen_chars = set()

    for page_number in range(PAGE_START, PAGE_END + 1):
        image_name = f"page-{page_number:02d}.jpg"
        image_path = pages_dir / image_name
        text = ocr_page_text(image_path, title, page_number)
        sentences = [{"words": text_to_words(sentence)} for sentence in split_sentences(text)]

        pages.append(
            {
                "pageIndex": page_number - PAGE_START,
                "imagePath": f"/books/{book_id}/pages/{image_name}",
                "sentences": sentences,
            }
        )

        for char in text:
            if char in PUNCTUATION or not re.match(r"[\u4e00-\u9fff]", char):
                continue
            if char in seen_chars:
                continue
            seen_chars.add(char)
            unique_chars.append(char)

    return {
        "id": book_id,
        "title": title,
        "series": SERIES,
        "level": LEVEL,
        "pageCount": BODY_PAGE_COUNT,
        "uniqueChars": unique_chars,
        "coverImage": f"/books/{book_id}/pages/page-01.jpg",
        "pages": pages,
    }


def write_book_files(book: dict) -> None:
    book_dir = BOOKS_DIR / book["id"]
    book_dir.mkdir(parents=True, exist_ok=True)

    with open(book_dir / "book.json", "w", encoding="utf-8") as f:
        json.dump(book, f, ensure_ascii=False, indent=2)
        f.write("\n")

    meta = {
        "id": book["id"],
        "title": book["title"],
        "series": book["series"],
        "level": book["level"],
        "pageCount": BODY_PAGE_COUNT,
        "uniqueChars": [],
        "coverImage": f"/books/{book['id']}/pages/page-01.jpg",
    }
    with open(book_dir / "meta.json", "w", encoding="utf-8") as f:
        json.dump(meta, f, ensure_ascii=False, indent=2)
        f.write("\n")


def update_catalog(books: list[dict]) -> None:
    catalog = []
    if CATALOG_PATH.exists():
        with open(CATALOG_PATH, "r", encoding="utf-8") as f:
            catalog = json.load(f)

    ids = {book["id"] for book in books}
    catalog = [item for item in catalog if item["id"] not in ids]

    for book in books:
        catalog.append(
            {
                "id": book["id"],
                "title": book["title"],
                "series": book["series"],
                "level": book["level"],
                "pageCount": book["pageCount"],
                "uniqueChars": book["uniqueChars"],
                "coverImage": book["coverImage"],
            }
        )

    catalog.sort(key=lambda item: item["id"])
    with open(CATALOG_PATH, "w", encoding="utf-8") as f:
        json.dump(catalog, f, ensure_ascii=False, indent=2)
        f.write("\n")


def main() -> None:
    books = []
    for book_no, title in TITLE_MAP.items():
        print(f"Processing {book_no:02d} {title}...")
        book = make_book(book_no, title)
        write_book_files(book)
        books.append(book)
    update_catalog(books)
    print(f"Done: {len(books)} books")


if __name__ == "__main__":
    main()
