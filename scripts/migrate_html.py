import os
import re

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content

    # 1. Fonts
    content = content.replace(
        '<link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" rel="stylesheet">',
        '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">'
    )
    content = content.replace("font-family: 'Press Start 2P', cursive;", "font-family: 'Inter', sans-serif;")
    content = content.replace("font-family: 'Press Start 2P';", "font-family: 'Inter', sans-serif;")
    content = content.replace("font-family: 'Press Start 2P'", "font-family: 'Inter', sans-serif")
    content = content.replace('font-family: "Press Start 2P"', "font-family: 'Inter', sans-serif")

    # 2. JS files
    # Remove script tags for stars and particles
    content = re.sub(r'<script.*?(stars\.js|particles\.js|splash-screen\.js).*?</script>\n?', '', content, flags=re.IGNORECASE)

    # 3. CSS files
    content = re.sub(r'<link.*?splash-screen\.css.*?>\n?', '', content, flags=re.IGNORECASE)

    # 4. Remove Splash Screen div
    # We find '<div id="splash-screen"' and match until its closing div
    # using a simple balanced tag approach
    start_idx = content.find('<div id="splash-screen"')
    if start_idx != -1:
        # Check if there is a comment just before it
        comment_idx = content.rfind('<!-- Splash Screen -->', max(0, start_idx-50), start_idx)
        actual_start = comment_idx if comment_idx != -1 else start_idx
        
        div_count = 0
        in_tag = False
        tag_name = ""
        closing_tag = False
        
        i = start_idx
        while i < len(content):
            if content[i:i+4] == '<div':
                div_count += 1
                i += 4
                continue
            elif content[i:i+6] == '</div>':
                div_count -= 1
                i += 6
                if div_count == 0:
                    break
                continue
            i += 1
        
        if div_count == 0:
            content = content[:actual_start] + content[i:]

    # 5. Remove star-background
    content = re.sub(r'<div id="star-background"[\s\S]*?</div>\n?', '', content)
    
    # 6. Remove particles-container
    content = re.sub(r'<div id="particles-container"[\s\S]*?</div>\n?', '', content)

    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    return False

def main():
    directory = r"e:\proyectos python\web"
    modified_count = 0
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith('.html'):
                filepath = os.path.join(root, file)
                if process_file(filepath):
                    print(f"Modified: {filepath}")
                    modified_count += 1
    
    print(f"Total files modified: {modified_count}")

if __name__ == '__main__':
    main()
