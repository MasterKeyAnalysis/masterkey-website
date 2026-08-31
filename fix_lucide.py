import os
import re

REPLACEMENTS = {
    r'\bKey\b': 'KeyRound as Key',
    r'\bUser\b': 'UserCheck as User',
}

def fix_lucide_imports(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    pattern = r'import\s+\{([^}]+)\}\s+from\s+["\']lucide-react["\'];?'

    def replacer(match):
        imports = match.group(1).split(',')
        cleaned_imports = []
        for imp in imports:
            imp_strip = imp.strip()
            if imp_strip in ['Key', 'User']:
                if imp_strip == 'Key':
                    cleaned_imports.append('KeyRound as Key')
                elif imp_strip == 'User':
                    cleaned_imports.append('UserCheck as User')
            else:
                cleaned_imports.append(imp_strip)

        return f'import {{ {", ".join(cleaned_imports)} }} from "lucide-react";'

    new_content = re.sub(pattern, replacer, content)

    if new_content != content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Fixed Lucide imports in: {file_path}")

def scan_directory(directory):
    for root, _, files in os.walk(directory):
        for file in files:
            if file.endswith(('.js', '.jsx', '.ts', '.tsx')):
                fix_lucide_imports(os.path.join(root, file))

if __name__ == "__main__":
    src_dir = os.path.join(os.getcwd(), 'frontend', 'src')
    if not os.path.exists(src_dir):
        src_dir = os.path.join(os.getcwd(), 'src')

    print(f"Scanning directory: {src_dir}")
    scan_directory(src_dir)
    print("Scan completed!")
