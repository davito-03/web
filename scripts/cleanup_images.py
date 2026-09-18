import os
from pathlib import Path

# Configuration
PROJECT_ROOT = Path(__file__).resolve().parent.parent
MEDIA_DIR = PROJECT_ROOT / "media"

def main():
    print("--- Starting Redundant Image Cleanup ---")
    deleted_count = 0
    kept_count = 0
    
    # Extensions to check
    extensions = ['*.png', '*.jpg', '*.jpeg', '*.PNG', '*.JPG', '*.JPEG']
    
    images_to_check = []
    for ext in extensions:
        images_to_check.extend(MEDIA_DIR.rglob(ext))

    print(f"Found {len(images_to_check)} candidate images.")

    for img_path in images_to_check:
        # Check for WebP equivalent
        webp_path = img_path.with_suffix('.webp')
        
        if webp_path.exists():
            try:
                # Double check sizes or something? No, simply existence is enough per request.
                os.remove(img_path)
                print(f"[DELETED] {img_path.name} (WebP key found)")
                deleted_count += 1
            except Exception as e:
                print(f"[ERROR] Could not delete {img_path.name}: {e}")
        else:
            # print(f"[KEPT] {img_path.name} (No WebP version)")
            kept_count += 1

    print(f"\n--- Cleanup Complete ---")
    print(f"Deleted: {deleted_count}")
    print(f"Kept: {kept_count}")

if __name__ == "__main__":
    main()
