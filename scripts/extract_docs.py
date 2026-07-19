import os
import sys

def extract_doc_to_txt(doc_path: str, txt_path: str):
    """
    Uses win32com to open a .doc file in a hidden Word instance,
    extracts the raw text, and saves it to a .txt file.
    """
    try:
        import win32com.client
    except ImportError:
        print("Error: pywin32 module is not installed. Run: pip install pywin32")
        sys.exit(1)

    # Convert to absolute paths as win32com requires them
    doc_abs = os.path.abspath(doc_path)
    txt_abs = os.path.abspath(txt_path)

    if not os.path.exists(doc_abs):
        print(f"Error: Document not found at {doc_abs}")
        sys.exit(1)

    print(f"Initializing Word Application COM object...")
    word = None
    try:
        word = win32com.client.Dispatch("Word.Application")
        word.Visible = False

        print(f"Opening document: {doc_abs}")
        # ReadOnly=True
        doc = word.Documents.Open(doc_abs, ReadOnly=True)
        
        print("Extracting text content...")
        text_content = doc.Content.Text

        print(f"Writing content to: {txt_abs}")
        os.makedirs(os.path.dirname(txt_abs), exist_ok=True)
        with open(txt_abs, 'w', encoding='utf-8') as f:
            f.write(text_content)
            
        doc.Close(False)
        print("Extraction complete.")

    except Exception as e:
        print(f"Failed to extract document: {e}")
        sys.exit(1)
    finally:
        if word:
            try:
                word.Quit()
            except:
                pass

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Extract text from .doc files.")
    parser.add_argument("input", help="Path to the input .doc file")
    parser.add_argument("output", help="Path to the output .txt file")
    
    args = parser.parse_args()
    extract_doc_to_txt(args.input, args.output)
