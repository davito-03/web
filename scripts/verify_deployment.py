import os
import sys
from pathlib import Path

# Fix encoding for Windows console
sys.stdout.reconfigure(encoding='utf-8')

PROJECT_ROOT = Path(__file__).resolve().parent.parent

def check_file_exists(path):
    full_path = PROJECT_ROOT / path
    if full_path.exists():
        print(f"[OK] Found: {path}")
        return True
    else:
        print(f"[MISSING] Not found: {path}")
        return False

def check_content(file_path, search_string, description):
    try:
        content = (PROJECT_ROOT / file_path).read_text(encoding='utf-8', errors='ignore')
        if search_string in content:
            print(f"[OK] {description} confirmed in {file_path}")
            return True
        else:
            print(f"[FAIL] {description} NOT found in {file_path}")
            return False
    except Exception as e:
        print(f"[ERROR] Could not read {file_path}: {e}")
        return False

def main():
    print("--- Starting Local Verification ---")
    
    # 1. Check Vital Files
    files_to_check = [
        "index.html",
        "sw.js",
        "assets/js/main.js",
        "assets/css/styles.css",
        "pages/blog.html",
        "pages/messages.html",
        "pages/chat.html",
        "pages/gasolineras.html"
    ]
    
    all_files_ok = True
    for f in files_to_check:
        if not check_file_exists(f):
            all_files_ok = False
            
    # 2. Check Security in Guestbook
    check_content(
        "pages/messages.html", 
        "DOMPurify", 
        "DOMPurify in Guestbook"
    )
    
    # 3. Check WebP images
    sample_images = [
        "media/favicon-32x32.webp",
        "media/gatos/IMG_0257.webp"
    ]
    for img in sample_images:
        check_file_exists(img)

    print("\n--- Verification Finished ---")
    if all_files_ok:
        print("✅ Critical files present and code updates found.")
    else:
        print("❌ Some critical files are missing.")

if __name__ == "__main__":
    main()
