import os
import fitz  # PyMuPDF
from PIL import Image
import io

# Region names matching PDF files
regions = ['appalatia', 'bay', 'blue', 'central', 'hampton',
           'mountains', 'north', 'shore', 'south', 'valley']

# Paths
input_dir = r'C:\Users\dpidd\OneDrive\awsdev\wine\original data'
output_dir = r'C:\Users\dpidd\OneDrive\awsdev\wine\public\regions'
os.makedirs(output_dir, exist_ok=True)

print("Extracting regions from PDF files...")

for region in regions:
    pdf_path = os.path.join(input_dir, f'wine{region}.pdf')

    if not os.path.exists(pdf_path):
        print(f'[ERROR] PDF not found: {pdf_path}')
        continue

    try:
        print(f'Processing {region}...')

        # Open PDF
        doc = fitz.open(pdf_path)
        page = doc[0]  # First page

        # Render page to pixmap
        pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))  # 2x scale for better quality

        # Convert to PNG
        output_path = os.path.join(output_dir, f'{region}.png')
        pix.save(output_path)

        print(f'[OK] Extracted {region}.png ({pix.width}x{pix.height})')

        doc.close()

    except Exception as e:
        print(f'[ERROR] Error processing {region}: {e}')

print(f'\n[COMPLETE] Extraction complete! Files saved to {output_dir}')
