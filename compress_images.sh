#!/bin/bash
# Skript pro kompresi obrázků pomocí sips (macOS) nebo ImageMagick
# Optimalizuje PNG a JPEG obrázky

IMAGES_DIR="fotky"
BACKUP_DIR="${IMAGES_DIR}/backup_original"

# Vytvořit backup adresář
mkdir -p "$BACKUP_DIR"

echo "📸 Komprese obrázků v adresáři: $IMAGES_DIR"
echo ""

# Počítadlo
total_original=0
total_new=0
processed=0

# Funkce pro získání velikosti souboru v MB
get_size_mb() {
    if [[ "$OSTYPE" == "darwin"* ]]; then
        stat -f%z "$1" | awk '{printf "%.2f", $1/1024/1024}'
    else
        stat -c%s "$1" | awk '{printf "%.2f", $1/1024/1024}'
    fi
}

# Funkce pro kompresi pomocí sips (macOS)
compress_with_sips() {
    local input="$1"
    local temp_output="${input}.tmp"
    
    # Získat informace o obrázku
    local width=$(sips -g pixelWidth "$input" 2>/dev/null | tail -1 | awk '{print $2}')
    
    # Pro obrázky širší než 1920px zmenšit
    if [ "$width" -gt 1920 ]; then
        echo "  ↳ Zmenšování z ${width}px na 1920px"
        sips -Z 1920 "$input" --out "$temp_output" >/dev/null 2>&1
        if [ -f "$temp_output" ]; then
            mv "$temp_output" "$input"
        fi
    fi
    
    # Komprese JPEG
    if [[ "$input" == *.jpg ]] || [[ "$input" == *.JPG ]] || [[ "$input" == *.jpeg ]] || [[ "$input" == *.JPEG ]]; then
        # sips neumí přímo komprimovat JPEG kvalitu, ale můžeme použít ImageOptim nebo jiný nástroj
        # Pro teď jen zmenšíme velikost pokud je potřeba
        echo "  ℹ️  JPEG soubory - použijte manuální optimalizaci pro lepší výsledky"
    fi
    
    # Komprese PNG
    if [[ "$input" == *.png ]] || [[ "$input" == *.PNG ]]; then
        # sips může komprimovat PNG, ale ne přímo kvalitu
        # Použijeme základní optimalizaci
        sips -s format png "$input" --out "$input" >/dev/null 2>&1
    fi
}

# Funkce pro kompresi pomocí ImageMagick (pokud je k dispozici)
compress_with_magick() {
    local input="$1"
    
    local width=$(identify -format "%w" "$input" 2>/dev/null)
    
    if [ "$width" -gt 1920 ]; then
        echo "  ↳ Zmenšování z ${width}px na 1920px"
        convert "$input" -resize 1920x\> -quality 85 "$input" 2>/dev/null
    else
        # Pouze optimalizovat
        if [[ "$input" == *.jpg ]] || [[ "$input" == *.JPG ]] || [[ "$input" == *.jpeg ]] || [[ "$input" == *.JPEG ]]; then
            convert "$input" -quality 85 -strip -interlace Plane "$input" 2>/dev/null
        elif [[ "$input" == *.png ]] || [[ "$input" == *.PNG ]]; then
            convert "$input" -strip -quality 85 "$input" 2>/dev/null
        fi
    fi
}

# Zkontrolovat dostupné nástroje
USE_SIPS=false
USE_MAGICK=false

if command -v sips &> /dev/null; then
    USE_SIPS=true
    echo "✅ Používám sips (macOS nástroj)"
elif command -v convert &> /dev/null || command -v magick &> /dev/null; then
    USE_MAGICK=true
    echo "✅ Používám ImageMagick"
else
    echo "❌ Nenalezen žádný nástroj pro kompresi!"
    echo "📦 Možnosti:"
    echo "   1. Nainstalovat Pillow: pip3 install Pillow (pak použijte compress_images.py)"
    echo "   2. Použít online nástroj (např. TinyPNG, Squoosh.app)"
    echo "   3. Nainstalovat ImageMagick: brew install imagemagick"
    exit 1
fi

# Zpracovat všechny obrázky
for img in "$IMAGES_DIR"/*.{png,jpg,jpeg,PNG,JPG,JPEG} 2>/dev/null; do
    if [ ! -f "$img" ]; then
        continue
    fi
    
    filename=$(basename "$img")
    echo "🔧 Komprimuji: $filename"
    
    # Zálohovat originál
    if [ ! -f "$BACKUP_DIR/$filename" ]; then
        cp "$img" "$BACKUP_DIR/$filename"
        echo "  ↳ Záloha vytvořena"
    fi
    
    # Získat původní velikost
    original_size=$(get_size_mb "$img")
    total_original=$(echo "$total_original + $original_size" | bc)
    
    # Komprimovat
    if [ "$USE_SIPS" = true ]; then
        compress_with_sips "$img"
    elif [ "$USE_MAGICK" = true ]; then
        compress_with_magick "$img"
    fi
    
    # Získat novou velikost
    new_size=$(get_size_mb "$img")
    total_new=$(echo "$total_new + $new_size" | bc)
    
    # Vypočítat úsporu
    savings=$(echo "scale=1; ($original_size - $new_size) / $original_size * 100" | bc 2>/dev/null || echo "0")
    
    echo "  ✅ ${original_size} MB → ${new_size} MB (${savings}% úspora)"
    echo ""
    
    processed=$((processed + 1))
done

if [ $processed -eq 0 ]; then
    echo "❌ Nebyly nalezeny žádné obrázky k kompresi!"
    exit 1
fi

# Celkové statistiky
echo "📊 Celkové statistiky:"
echo "   Zpracováno obrázků: $processed"
echo "   Původní velikost: ${total_original} MB"
echo "   Nová velikost: ${total_new} MB"
total_savings=$(echo "scale=1; ($total_original - $total_new) / $total_original * 100" | bc 2>/dev/null || echo "0")
total_saved=$(echo "scale=2; $total_original - $total_new" | bc 2>/dev/null || echo "0")
echo "   Úspora: ${total_savings}% (${total_saved} MB)"
echo ""
echo "💾 Originály zálohovány v: $BACKUP_DIR"
echo "✅ Komprese dokončena!"

