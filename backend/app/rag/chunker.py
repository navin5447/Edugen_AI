from typing import List
from uuid import uuid4

from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter


class TextChunker:
    def __init__(self, chunk_size: int = 1000, chunk_overlap: int = 200):
        self.splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
            separators=["\n\n", "\n", " ", ""],
        )

    def chunk_pages(self, pages: List[dict], base_metadata: dict | None = None) -> List[Document]:
        documents: List[Document] = []
        chunk_counter = 0
        for page in pages:
            text = page.get("text", "").strip()
            if not text:
                continue

            metadata = dict(base_metadata or {})
            metadata["page_number"] = page.get("page_number")
            page_documents = self.splitter.create_documents([text], metadatas=[metadata])
            for document in page_documents:
                chunk_counter += 1
                chunk_metadata = dict(document.metadata)
                chunk_metadata["chunk_id"] = chunk_metadata.get("chunk_id") or f"{metadata.get('file_id', uuid4().hex)}_chunk_{chunk_counter}"
                chunk_metadata["chunk_index"] = chunk_counter
                chunk_metadata["file_name"] = chunk_metadata.get("file_name") or metadata.get("file_name")
                chunk_metadata["page_number"] = metadata.get("page_number")
                documents.append(Document(page_content=document.page_content, metadata=chunk_metadata))
        return documents
