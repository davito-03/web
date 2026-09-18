import os

media_dir = r"e:\proyectos python\web\media"
for d in os.listdir(media_dir):
    if d.startswith("depresi"):
        old_path = os.path.join(media_dir, d)
        new_path = os.path.join(media_dir, "depresión")
        if old_path != new_path:
            os.rename(old_path, new_path)
            print(f"Renamed {d} to depresión")
            break
