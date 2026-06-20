from io import BytesIO
from typing import List

from pypdf import PdfReader


def extract_pages(pdf_bytes: bytes) -> List[dict]:
    reader = PdfReader(BytesIO(pdf_bytes))
    pages: List[dict] = []
    for index, page in enumerate(reader.pages, start=1):
        text = page.extract_text() or ""
        pages.append({"page_number": index, "text": text})
    return pages
