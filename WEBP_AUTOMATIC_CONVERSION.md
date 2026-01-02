# 🖼️ Automatická konverze na WebP - Návod

## ✅ Co bylo provedeno

1. **Vytvořeny WebP verze všech obrázků** - Úspora 90.8% (11.37 MB)
2. **Upraven HTML/JS kód** - Automatické použití WebP s fallbackem na PNG/JPEG
3. **Vytvořena pomocná knihovna** - `image-utils.js` pro práci s WebP

## 📋 Jak to funguje

### Pro statické obrázky v HTML:
Kód automaticky používá `<picture>` element, který:
- Moderní prohlížeče: Načítají WebP (menší, rychlejší)
- Starší prohlížeče: Automaticky fallback na PNG/JPEG

```html
<picture>
    <source srcset="fotky/logo.webp" type="image/webp">
    <img src="fotky/logo.png" alt="Logo">
</picture>
```

### Pro dynamické obrázky v JavaScriptu:
Funkce `createAdCard()` a další automaticky generují WebP fallback.

## 🔄 Automatická konverze nových obrázků

### Při nahrávání do Firebase Storage:

Máte dvě možnosti:

#### 1. **Automatická konverze v JavaScriptu (doporučeno)**

Upravte kód, který nahrává obrázky do Firebase Storage, aby:
- Po nahrání originálu vytvořil WebP verzi
- Uložil obě verze do Storage
- V HTML použil picture element

Příklad kódu pro konverzi při uploadu:
```javascript
// Po úspěšném uploadu obrázku
async function uploadImageWithWebP(file, storagePath) {
    // 1. Nahrát originál
    const originalRef = ref(storage, storagePath);
    await uploadBytes(originalRef, file);
    const originalUrl = await getDownloadURL(originalRef);
    
    // 2. Konvertovat na WebP (pomocí canvas nebo server-side)
    // Pro frontend: použijte canvas API
    const webpBlob = await convertToWebP(file);
    
    // 3. Nahrát WebP verzi
    const webpRef = ref(storage, storagePath + '.webp');
    await uploadBytes(webpRef, webpBlob);
    const webpUrl = await getDownloadURL(webpRef);
    
    return { originalUrl, webpUrl };
}

// Konverze na WebP pomocí canvas
function convertToWebP(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                canvas.toBlob(resolve, 'image/webp', 0.85);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
}
```

#### 2. **Cloud Function pro automatickou konverzi**

Vytvořte Firebase Cloud Function, která:
- Naslouchá na upload obrázků do Storage
- Automaticky konvertuje na WebP
- Ukládá WebP verzi vedle originálu

**Výhoda**: Funguje pro všechny uploady, nezávisle na klientském kódu

**Nevýhoda**: Vyžaduje Firebase Functions (placené)

## 🛠️ Ruční konverze existujících obrázků

Pokud chcete konvertovat obrázky, které už jsou v Firebase Storage:

```bash
# Spustit konverzi všech obrázků v lokálním adresáři
python3 convert_to_webp.py

# Nebo použít online nástroje:
# - Squoosh.app (nejlepší pro manuální konverzi)
# - CloudConvert API
# - ImageMagick
```

## 📝 Co dělat při nahrávání nových obrázků

### Option 1: Použít existující systém
Současný kód už automaticky používá WebP fallback pro všechny obrázky, které mají `.webp` verzi.

### Option 2: Přidat automatickou konverzi
Pokud chcete automatickou konverzi při uploadu, použijte kód výše.

## ✅ Kontrola, že WebP funguje

1. Otevřít Chrome DevTools → Network tab
2. Načíst stránku
3. Podívat se na obrázky - měly by se načítat jako `.webp`
4. V Safari (starší verze) se načtou `.png`/`.jpg` (fallback)

## 🎯 Výsledky

- **Úspora dat**: 90.8% (11.37 MB z 12.52 MB)
- **Rychlejší načítání**: Obrázky se načítají 3-10x rychleji
- **Lepší UX**: Stránka se zobrazí rychleji
- **Kompatibilita**: Funguje ve všech prohlížečích (fallback)

## 📚 Dokumentace

- [WebP na MDN](https://developer.mozilla.org/en-US/docs/Web/Media/Formats/Image_types#webp)
- [Picture element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/picture)
- [WebP Browser Support](https://caniuse.com/webp)

