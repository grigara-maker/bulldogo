#!/usr/bin/env python3
"""
Skript pro konverzi obrázků na WebP formát
Vytváří WebP verze s automatickým fallbackem
"""

import os
import sys
from pathlib import Path

try:
    from PIL import Image, ImageOps
except ImportError:
    print("❌ Chybí Pillow! Instaluji...")
    import subprocess
    subprocess.check_call([sys.executable, '-m', 'pip', 'install', '--user', 'Pillow'])
    from PIL import Image, ImageOps

def convert_to_webp(input_path, output_path=None, quality=85):
    """
    Konvertuje obrázek na WebP formát
    
    Args:
        input_path: Cesta k vstupnímu obrázku
        output_path: Cesta k výstupnímu WebP (pokud None, použije stejné jméno s .webp)
        quality: Kvalita (1-100, vyšší = lepší kvalita, větší soubor)
    """
    try:
        img = Image.open(input_path)
        original_size = os.path.getsize(input_path)
        
        # EXIF transpozice
        try:
            img = ImageOps.exif_transpose(img)
        except:
            pass
        
        # Určit výstupní cestu
        if output_path is None:
            output_path = input_path.with_suffix('.webp')
        
        # Uložit jako WebP
        # WebP podporuje RGBA, takže nemusíme konvertovat
        if img.mode in ('RGBA', 'LA'):
            # Zachovat průhlednost
            img.save(output_path, 'WEBP', quality=quality, method=6)
        else:
            # RGB nebo jiné režimy
            if img.mode != 'RGB':
                img = img.convert('RGB')
            img.save(output_path, 'WEBP', quality=quality, method=6)
        
        webp_size = os.path.getsize(output_path)
        savings = ((original_size - webp_size) / original_size * 100) if original_size > 0 else 0
        
        return {
            'success': True,
            'original_size': original_size,
            'webp_size': webp_size,
            'savings': savings,
            'output_path': output_path
        }
    except Exception as e:
        return {
            'success': False,
            'error': str(e)
        }

def main():
    images_dir = Path('fotky')
    
    if not images_dir.exists():
        print(f"❌ Adresář {images_dir} neexistuje!")
        sys.exit(1)
    
    # Najít všechny obrázky (kromě těch, co už jsou WebP a backupů)
    image_extensions = ['.png', '.jpg', '.jpeg', '.PNG', '.JPG', '.JPEG']
    image_files = []
    for ext in image_extensions:
        image_files.extend(images_dir.glob(f'*{ext}'))
        # Nezahrnout backup adresář
        image_files = [f for f in image_files if 'backup' not in str(f)]
    
    if not image_files:
        print("❌ Nebyly nalezeny žádné obrázky!")
        sys.exit(1)
    
    print(f"🔄 Konvertuji {len(image_files)} obrázků na WebP...\n")
    
    total_original = 0
    total_webp = 0
    converted = 0
    
    for img_path in sorted(image_files):
        webp_path = img_path.with_suffix('.webp')
        
        # Přeskočit, pokud WebP už existuje
        if webp_path.exists():
            print(f"⏭️  Přeskakuji {img_path.name} (WebP již existuje)")
            continue
        
        print(f"🔄 {img_path.name} → {webp_path.name}")
        
        # Pro logo a kritické obrázky použít vyšší kvalitu
        is_critical = 'logo' in img_path.name.lower() or 'overlay' in img_path.name.lower()
        quality = 90 if is_critical else 85
        
        result = convert_to_webp(img_path, webp_path, quality=quality)
        
        if result['success']:
            total_original += result['original_size']
            total_webp += result['webp_size']
            converted += 1
            print(f"   ✅ {result['original_size']/1024/1024:.2f} MB → {result['webp_size']/1024/1024:.2f} MB "
                  f"({result['savings']:.1f}% úspora)")
        else:
            print(f"   ❌ Chyba: {result['error']}")
    
    if converted > 0:
        print(f"\n📊 Celkové statistiky:")
        print(f"   Konvertováno: {converted} obrázků")
        print(f"   Původní velikost: {total_original/1024/1024:.2f} MB")
        print(f"   WebP velikost: {total_webp/1024/1024:.2f} MB")
        if total_original > 0:
            total_savings = ((total_original - total_webp) / total_original) * 100
            print(f"   Úspora: {total_savings:.1f}% ({(total_original-total_webp)/1024/1024:.2f} MB)")
        print("\n✅ Konverze dokončena!")
        print("📝 Nyní je potřeba upravit HTML kód, aby používal picture elementy")
    else:
        print("\n✅ Všechny obrázky už mají WebP verze!")

if __name__ == '__main__':
    main()

