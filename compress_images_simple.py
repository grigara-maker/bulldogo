#!/usr/bin/env python3
"""
Jednoduchý skript pro kompresi obrázků pomocí Pillow
Pokud Pillow není nainstalován, použije se sips (macOS) nebo ImageMagick
"""

import os
import sys
import subprocess
from pathlib import Path

def install_pillow():
    """Zkusit nainstalovat Pillow"""
    print("📦 Instaluji Pillow...")
    try:
        subprocess.check_call([sys.executable, '-m', 'pip', 'install', '--user', 'Pillow'], 
                            stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        print("✅ Pillow nainstalován!")
        return True
    except Exception as e:
        print(f"⚠️  Nepodařilo se nainstalovat Pillow: {e}")
        return False

def try_import_pillow():
    """Zkusit importovat Pillow, pokud selže, zkusit nainstalovat"""
    try:
        from PIL import Image, ImageOps
        return Image, ImageOps
    except ImportError:
        if install_pillow():
            try:
                from PIL import Image, ImageOps
                return Image, ImageOps
            except ImportError:
                pass
        return None, None

def compress_with_pillow(img_path, quality=85, max_width=1920):
    """Komprimovat obrázek pomocí Pillow"""
    Image, ImageOps = try_import_pillow()
    if Image is None:
        return False
    
    try:
        img = Image.open(img_path)
        original_size = os.path.getsize(img_path)
        
        # EXIF transpozice
        try:
            img = ImageOps.exif_transpose(img)
        except:
            pass
        
        # Resize pokud je potřeba
        if img.width > max_width:
            ratio = max_width / img.width
            new_height = int(img.height * ratio)
            img = img.resize((max_width, new_height), Image.Resampling.LANCZOS)
        
        # Uložit s optimalizací
        if img_path.suffix.lower() in ['.jpg', '.jpeg']:
            if img.mode in ('RGBA', 'LA', 'P'):
                background = Image.new('RGB', img.size, (255, 255, 255))
                if img.mode == 'P':
                    img = img.convert('RGBA')
                background.paste(img, mask=img.split()[-1] if img.mode in ('RGBA', 'LA') else None)
                img = background
            img.save(img_path, 'JPEG', quality=quality, optimize=True, progressive=True)
        elif img_path.suffix.lower() == '.png':
            img.save(img_path, 'PNG', optimize=True)
        
        new_size = os.path.getsize(img_path)
        return original_size, new_size
    except Exception as e:
        print(f"    ❌ Chyba: {e}")
        return False

def compress_with_sips(img_path):
    """Komprimovat pomocí sips (macOS)"""
    try:
        # Získat šířku
        result = subprocess.run(['sips', '-g', 'pixelWidth', str(img_path)], 
                              capture_output=True, text=True)
        width = None
        for line in result.stdout.split('\n'):
            if 'pixelWidth' in line:
                width = int(line.split()[-1])
                break
        
        original_size = os.path.getsize(img_path)
        
        # Resize pokud je potřeba
        if width and width > 1920:
            subprocess.run(['sips', '-Z', '1920', str(img_path)], 
                         stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        
        new_size = os.path.getsize(img_path)
        return original_size, new_size
    except Exception:
        return False

def main():
    images_dir = Path('fotky')
    if not images_dir.exists():
        print(f"❌ Adresář {images_dir} neexistuje!")
        return 1
    
    # Zkusit Pillow
    Image, ImageOps = try_import_pillow()
    use_pillow = Image is not None
    
    if not use_pillow:
        print("⚠️  Pillow není k dispozici, používám sips (macOS)...")
        if subprocess.run(['which', 'sips'], capture_output=True).returncode != 0:
            print("❌ Není k dispozici ani sips!")
            print("📦 Instalujte Pillow: pip3 install Pillow")
            return 1
    
    # Backup
    backup_dir = images_dir / 'backup_original'
    backup_dir.mkdir(exist_ok=True)
    
    # Najít obrázky
    exts = ['.png', '.jpg', '.jpeg', '.PNG', '.JPG', '.JPEG']
    images = []
    for ext in exts:
        images.extend(images_dir.glob(f'*{ext}'))
    
    if not images:
        print("❌ Nebyly nalezeny žádné obrázky!")
        return 1
    
    print(f"📸 Nalezeno {len(images)} obrázků\n")
    
    total_orig = 0
    total_new = 0
    
    for img_path in sorted(images):
        print(f"🔧 {img_path.name}")
        
        # Backup
        backup_path = backup_dir / img_path.name
        if not backup_path.exists():
            import shutil
            shutil.copy2(img_path, backup_path)
        
        # Komprese
        is_critical = 'logo' in img_path.name.lower()
        quality = 90 if is_critical else 85
        
        if use_pillow:
            result = compress_with_pillow(img_path, quality=quality)
        else:
            result = compress_with_sips(img_path)
        
        if result:
            orig_size, new_size = result
            total_orig += orig_size
            total_new += new_size
            savings = ((orig_size - new_size) / orig_size * 100) if orig_size > 0 else 0
            print(f"   ✅ {orig_size/1024/1024:.2f} MB → {new_size/1024/1024:.2f} MB ({savings:.1f}% úspora)")
        else:
            print(f"   ⚠️  Přeskočeno")
    
    print(f"\n📊 Celkem: {total_orig/1024/1024:.2f} MB → {total_new/1024/1024:.2f} MB")
    if total_orig > 0:
        total_savings = ((total_orig - total_new) / total_orig * 100)
        print(f"   Úspora: {total_savings:.1f}% ({(total_orig-total_new)/1024/1024:.2f} MB)")
    print(f"\n💾 Zálohy v: {backup_dir}")
    
    return 0

if __name__ == '__main__':
    sys.exit(main())

