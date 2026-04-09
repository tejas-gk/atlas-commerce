# indexer.py
import os

IGNORE_FOLDERS = {".git", "node_modules", "__pycache__", "venv"}

def should_ignore(path):
    return any(folder in path for folder in IGNORE_FOLDERS)


def load_codebase(root_path="."):
    docs = []

    for root, dirs, files in os.walk(root_path):
        # skip unwanted folders
        if should_ignore(root):
            continue

        for file in files:
            if file.endswith(".py"):  # you can extend later

                full_path = os.path.join(root, file)

                try:
                    with open(full_path, encoding="utf-8") as f:
                        content = f.read()
                except:
                    continue

                # 🔥 split into chunks (important)
                chunks = content.split("\n\n")

                for chunk in chunks:
                    chunk = chunk.strip()
                    if len(chunk) > 20:  # ignore tiny junk
                        docs.append(chunk)

    print(f"✅ Indexed {len(docs)} code chunks")
    return docs