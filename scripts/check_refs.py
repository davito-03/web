import os
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
EXTENSIONS = ['.html', '.css', '.js']

def check_broken_refs():
    print("Checking for broken .png/.jpg references...")
    
    for root, dirs, files in os.walk(PROJECT_ROOT):
        if 'node_modules' in root or '.git' in root: continue
        
        for file in files:
            if any(file.endswith(ext) for ext in EXTENSIONS):
                path = Path(root) / file
                try:
                    content = path.read_text(encoding='utf-8')
                    # distinct check
                    if '.png' in content or '.jpg' in content:
                        print(f"File: {path.name}")
                        # print context
                        for line in content.splitlines():
                            if '.png' in line or '.jpg' in line:
                                print(f"  Line: {line.strip()[:100]}...")
                except:
                    pass

if __name__ == "__main__":
    check_broken_refs()
