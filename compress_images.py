#!/usr/bin/env python3
"""
Skript pro kompresi obrázků v projektu Bulldogo
Optimalizuje PNG a JPEG obrázky, případně vytváří WebP verze
"""

import os
import sys
from pathlib import Path

try:
    from PIL import Image, ImageOps
    import pillow_heif  # Pro HEIF podporu (volitelné)
    pillow_heif.register_heif_opener()
except ImportError:
    print("❌ Chybí knihovny! Instaluji Pillow...")
    print("Spusťte: pip3 install Pillow pillow-heif")
    sys.exit(1)

def get_file_size_mb(filepath):
    """Vrátí velikost souboru v MB"""
    return os.path.getsize(filepath) / (1024 * 1024)

def compress_image(input_path, output_path=None, quality=85, max_width=None, format_override=None):
    """
    Komprimuje obrázek
    
    Args:
        input_path: Cesta k vstupnímu obrázku
        output_path: Cesta k výstupnímu obrázku (pokud None, přepíše originál)
        quality: Kvalita komprese (1-100, vyšší = lepší kvalita, větší soubor)
        max_width: Maximální šířka v pixelech (None = zachovat původní)
        format_override: Formát výstupu (None = zachovat původní)
    """
    try:
        # Otevřít obrázek
        img = Image.open(input_path)
        original_format = img.format
        original_size = get_file_size_mb(input_path)
        
        # Optimalizovat orientaci (odstranit EXIF rotaci)
        try:
            img = ImageOps.exif_transpose(img)
        except Exception:
            pass  # Pokud není EXIF, pokračovat
        
        # Resize pokud je potřeba
        if max_width and img.width > max_width:
            ratio = max_width / img.width
            new_height = int(img.height * ratio)
            img = img.resize((max_width, new_height), Image.Resampling.LANCZOS)
            print(f"  ↳ Změna velikosti: {img.width}x{img.height}")
        
        # Určit výstupní formát
        output_format = format_override or original_format
        
        # JPEG specifické optimalizace
        if output_format in ('JPEG', 'JPG'):
            # Konvertovat RGBA na RGB pro JPEG
            if img.mode in ('RGBA', 'LA', 'P'):
                background = Image.new('RGB', img.size, (255, 255, 255))
                if img.mode == 'P':
                    img = img.convert('RGBA')
                background.paste(img, mask=img.split()[-1] if img.mode in ('RGBA', 'LA') else None)
                img = background
            
            # Uložit s optimalizací
            save_kwargs = {
                'format': 'JPEG',
                'quality': quality,
                'optimize': True,
                'progressive': True,  # Progressive JPEG pro lepší UX
            }
        # PNG specifické optimalizace
        elif output_format == 'PNG':
            # PNG komprese
            save_kwargs = {
                'format': 'PNG',
                'optimize': True,
            }
            # Pro PNG s malým počtem barev použít PALETTE
            if img.mode in ('RGBA', 'LA') and img.width * img.height < 1000000:
                try:
                    # Zkusit převést na PALETTE (menší velikost)
                    img_quantized = img.quantize(colors=256, method=Image.Quantize.MEDIANCUT)
                    if img.mode == 'RGBA':
                        img = img_quantized.convert('RGBA')
                    else:
                        img = img_quantized.convert('LA')
                except Exception:
                    pass  # Pokud selže, použít původní
        else:
            save_kwargs = {'format': output_format, 'optimize': True}
        
        # Určit výstupní cestu
        if output_path is None:
            output_path = input_path
        
        # Uložit komprimovaný obrázek
        img.save(output_path, **save_kwargs)
        
        new_size = get_file_size_mb(output_path)
        savings = ((original_size - new_size) / original_size) * 100 if original_size > 0 else 0
        
        return {
            'success': True,
            'original_size': original_size,
            'new_size': new_size,
            'savings': savings,
            'original_format': original_format,
            'output_format': output_format
        }
        
    except Exception as e:
        return {
            'success': False,
            'error': str(e)
        }

def main():
    # Adresář s obrázky
    images_dir = Path('fotky')
    
    if not images_dir.exists():
        print(f"❌ Adresář {images_dir} neexistuje!")
        sys.exit(1)
    
    # Najít všechny obrázky
    image_extensions = ['.png', '.jpg', '.jpeg', '.PNG', '.JPG', '.JPEG']
    image_files = []
    for ext in image_extensions:
        image_files.extend(images_dir.glob(f'*{ext}'))
    
    if not image_files:
        print("❌ Nebyly nalezeny žádné obrázky!")
        sys.exit(1)
    
    print(f"📸 Nalezeno {len(image_files)} obrázků k kompresi\n")
    
    # Vytvořit backup adresář
    backup_dir = images_dir / 'backup_original'
    backup_dir.mkdir(exist_ok=True)
    
    total_original_size = 0
    total_new_size = 0
    
    # Komprimovat každý obrázek
    for img_path in sorted(image_files):
        print(f"🔧 Komprimuji: {img_path.name}")
        
        # Zálohovat originál
        backup_path = backup_dir / img_path.name
        if not backup_path.exists():
            import shutil
            shutil.copy2(img_path, backup_path)
            print(f"  ↳ Záloha vytvořena: {backup_path.name}")
        
        # Komprese
        # Pro logo a kritické obrázky použít vyšší kvalitu
        is_critical = 'logo' in img_path.name.lower() or 'overlay' in img_path.name.lower()
        quality = 90 if is_critical else 85
        
        # Pro velké obrázky omezit šířku
        max_width = None
        img_temp = Image.open(img_path)
        if img_temp.width > 1920:
            max_width = 1920
        img_temp.close()
        
        result = compress_image(img_path, quality=quality, max_width=max_width)
        
        if result['success']:
            total_original_size += result['original_size']
            total_new_size += result['new_size']
            print(f"  ✅ {result['original_size']:.2f} MB → {result['new_size']:.2f} MB "
                  f"({result['savings']:.1f}% úspora)")
        else:
            print(f"  ❌ Chyba: {result['error']}")
    
    # Celkové statistiky
    print(f"\n📊 Celkové statistiky:")
    print(f"   Původní velikost: {total_original_size:.2f} MB")
    print(f"   Nová velikost: {total_new_size:.2f} MB")
    if total_original_size > 0:
        total_savings = ((total_original_size - total_new_size) / total_original_size) * 100
        print(f"   Úspora: {total_savings:.1f}% ({total_original_size - total_new_size:.2f} MB)")
    
    print(f"\n💾 Originály zálohovány v: {backup_dir}")
    print("✅ Komprese dokončena!")

if __name__ == '__main__':
    main()

