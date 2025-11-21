from PIL import Image, ImageDraw
import os

# Open the BMP file
img = Image.open(r'C:\Users\dpidd\OneDrive\awsdev\wine\original data\all regions.bmp')
width, height = img.size
print(f'Image size: {width}x{height}')

# Based on 10 regions and image dimensions, let's try different grid layouts
# Most likely 5 columns x 2 rows or 2 columns x 5 rows
# 4480 / 5 = 896 per box (width if 5 cols)
# 2489 / 2 = 1244.5 per box (height if 2 rows)

# Let's try 5 columns x 2 rows
cols = 5
rows = 2
box_width = width // cols
box_height = height // rows

print(f'\nTrying {cols}x{rows} grid layout:')
print(f'Box dimensions: {box_width}x{box_height}')

# Region names from PDF files
regions = ['appalatia', 'bay', 'blue', 'central', 'hampton',
           'mountains', 'north', 'shore', 'south', 'valley']

# Create output directory
output_dir = r'C:\Users\dpidd\OneDrive\awsdev\wine\public\regions'
os.makedirs(output_dir, exist_ok=True)

# Extract each box
for i in range(min(cols * rows, len(regions))):
    row = i // cols
    col = i % cols

    left = col * box_width
    top = row * box_height
    right = left + box_width
    bottom = top + box_height

    # Extract the box
    box = img.crop((left, top, right, bottom))

    # Save as PNG with transparency support
    output_path = os.path.join(output_dir, f'{regions[i]}.png')
    box.save(output_path, 'PNG')
    print(f'Extracted {regions[i]}: [{left}, {top}, {right}, {bottom}] -> {output_path}')

print(f'\nExtracted {len(regions)} region images to {output_dir}')
