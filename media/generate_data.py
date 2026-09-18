import os
import json

def generate_data_json():
    media_dir = r"e:\proyectos python\web\media"
    data = {"categories": []}
    
    # Valid image/video extensions
    valid_exts = {'.png', '.jpg', '.jpeg', '.gif', '.gifv', '.webp', '.mp4', '.mov', '.webm', '.avi'}

    for item in os.listdir(media_dir):
        cat_path = os.path.join(media_dir, item)
        if os.path.isdir(cat_path):
            files = []
            previews = []
            
            # Sort files so previews are consistent (optional, but good)
            all_files = sorted(os.listdir(cat_path))
            for f in all_files:
                ext = os.path.splitext(f)[1].lower()
                if ext in valid_exts:
                    files.append(f)
                    
            if files:
                # Add up to 2 previews
                for i in range(min(2, len(files))):
                    previews.append(f"{item}/{files[i]}")
                    
                data["categories"].append({
                    "name": item,
                    "files": files,
                    "previews": previews
                })
                
    # Save data.json
    output_path = os.path.join(media_dir, "data.json")
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"Generated data.json successfully with {len(data['categories'])} categories.")

if __name__ == '__main__':
    generate_data_json()
