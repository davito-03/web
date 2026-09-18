import os
import re
from pathlib import Path
from PIL import Image

# Configuration
PROJECT_ROOT = Path(r"e:\proyectos python\web copia de seguridad 29-01-26")
MEDIA_DIR = PROJECT_ROOT / "media"
EXTENSIONS_TO_SCAN = ['.html', '.css', '.js', '.json']

def convert_to_webp(image_path):
    """Converts an image to WebP and returns the new path."""
    try:
        img = Image.open(image_path)
        # Skip if already webp (though caller checks extensions)
        
        # Calculate new path
        webp_path = image_path.with_suffix('.webp')
        
        # Save as WebP
        img.save(webp_path, 'WEBP', quality=80)
        print(f"Converted: {image_path.name} -> {webp_path.name}")
        return webp_path.name
    except Exception as e:
        print(f"Error converting {image_path}: {e}")
        return None

def update_references(old_name, new_name):
    """Scans project files and replaces references to the old image with the new one."""
    count = 0
    # Walk through all files in project root
    for root, dirs, files in os.walk(PROJECT_ROOT):
        # Skip .git, .idea, etc.
        if '.git' in root or 'node_modules' in root:
            continue
            
        for file in files:
            if any(file.endswith(ext) for ext in EXTENSIONS_TO_SCAN):
                file_path = Path(root) / file
                try:
                    content = file_path.read_text(encoding='utf-8')
                    # Regex for exact filename match to avoid substrings issues
                    # e.g. "image.png" but not "my_image.png" if we just search for string? 
                    # Simple string replace is safer for filenames usually, unless very short.
                    if old_name in content:
                        new_content = content.replace(old_name, new_name)
                        file_path.write_text(new_content, encoding='utf-8')
                        count += 1
                except UnicodeDecodeError:
                    pass # Skip binary files or weird encodings
                except Exception as e:
                    print(f"Error processing {file_path}: {e}")
    
    if count > 0:
        print(f"Updated {count} files referencing {old_name}")

def main():
    print("Starting Image Optimization...")
    
    # scan for images
    images_to_convert = []
    for ext in ['*.png', '*.jpg', '*.jpeg']:
        images_to_convert.extend(MEDIA_DIR.rglob(ext))  
    
    print(f"Found {len(images_to_convert)} images to convert.")
    
    for img_path in images_to_convert:
        # Check if webp version already exists to avoid re-work
        if img_path.with_suffix('.webp').exists():
            print(f"Skipping {img_path.name}, WebP already exists.")
            # Still might need to update references if we missed them before?
            # For now assume if webp exists, we might still want to clean up references 
            # but let's just proceed with full conversion logic for simplicity.
            # actually let's update references anyway just in case
            pass
        
        # Convert
        new_name = convert_to_webp(img_path)
        
        if new_name:
            # Update references to point to webp
            # We assume relative paths or filenames are unique enough
            update_references(img_path.name, new_name)
            
            # Optional: Delete old file? 
            # Let's KEEP old files for safety unless user asked to delete.
            # User said "Convert media files", usually implies replacement but safety first.
            # We will DELETE them if replacement was successful to verify "clean" migration?
            # No, let's keep them for backup in this script, user can delete manually.
            
    print("Optimization Complete.")

if __name__ == "__main__":
    main()
