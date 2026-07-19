import fitz
import sys
import os

pdf_path = sys.argv[1]
out_dir = sys.argv[2]
os.makedirs(out_dir, exist_ok=True)

doc = fitz.open(pdf_path)
count = 1
for i, page in enumerate(doc):
    for img in page.get_images(full=True):
        xref = img[0]
        base_image = doc.extract_image(xref)
        image_bytes = base_image["image"]
        ext = base_image["ext"]
        with open(os.path.join(out_dir, f"img_{i+1}_{count}.{ext}"), "wb") as f:
            f.write(image_bytes)
        count += 1
print(f"Extracted {count-1} images")
