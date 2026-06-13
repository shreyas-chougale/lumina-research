import fitz  # PyMuPDF
import pdfplumber
from langchain_text_splitters import RecursiveCharacterTextSplitter

class PDFProcessor:
    def __init__(self):
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            length_function=len,
            is_separator_regex=False,
        )

    def extract_text(self, file_path: str) -> str:
        text = ""
        try:
            # Try PyMuPDF first (faster)
            doc = fitz.open(file_path)
            for page in doc:
                text += page.get_text()
            doc.close()
            
            # Fallback or supplement with pdfplumber if needed
            if not text.strip():
                with pdfplumber.open(file_path) as pdf:
                    for page in pdf.pages:
                        page_text = page.extract_text()
                        if page_text:
                            text += page_text + "\n"
        except Exception as e:
            raise ValueError(f"Failed to process PDF: {str(e)}")
            
        if not text.strip():
            raise ValueError("No text could be extracted from the PDF")
            
        return text
        
    def chunk_text(self, text: str) -> list[str]:
        return self.text_splitter.split_text(text)

pdf_processor = PDFProcessor()
