# 📸 Optimalizace načítání obrázků - Seznam dalších kroků

## ✅ Co bylo již implementováno:

1. **Lazy loading** - Obrázky se načítají pouze když jsou viditelné
2. **Fetchpriority** - První 3 obrázky mají vysokou prioritu
3. **Firebase Storage optimalizace** - Přidán parametr `alt=media` pro rychlejší načítání
4. **Shimmer placeholder** - Animovaný placeholder při načítání
5. **Retry mechanismus** - Automatický retry při chybě načítání
6. **Intersection Observer** - Lepší lazy loading s přednačtením 50px před viditelností
7. **Width/Height atributy** - Zabraňují layout shift
8. **Decoding async** - Asynchronní dekódování obrázků
9. **Error handling** - Fallback na výchozí obrázek při chybě
10. **CSS optimalizace** - `contain`, `will-change`, `content-visibility` pro rychlejší rendering

## 🔧 Co můžete udělat sami pro další optimalizaci:

### 1. **Firebase Storage - Resize obrázky při uploadu**
   - **Problém**: Obrázky jsou příliš velké (např. 5MB+)
   - **Řešení**: Při uploadu do Firebase Storage automaticky resize na max 800x600px nebo 1200x900px
   - **Kde**: V kódu pro upload obrázků (create-ad.html, edit-ad.html)
   - **Nástroj**: Použít `browser-image-compression` nebo `compressorjs` před uploadem

### 2. **Firebase Storage - Generovat thumbnaily**
   - **Problém**: Načítají se plné rozlišení i pro náhledy
   - **Řešení**: Vytvořit thumbnaily (např. 400x300px) při uploadu
   - **Kde**: Firebase Cloud Functions - trigger při uploadu
   - **Nástroj**: Firebase Storage Resize Images Extension

### 3. **CDN pro obrázky**
   - **Problém**: Firebase Storage může být pomalé v některých regionech
   - **Řešení**: Použít CDN (Cloudflare, CloudFront) před Firebase Storage
   - **Kde**: Firebase Hosting + CDN konfigurace

### 4. **Service Worker - Cache obrázky**
   - **Problém**: Obrázky se načítají znovu při každém návštěvě
   - **Řešení**: Cache obrázky v Service Worker
   - **Kde**: `service-worker.js` - přidat cache strategy pro obrázky
   - **Strategie**: Cache-First nebo Stale-While-Revalidate

### 5. **Preload kritické obrázky**
   - **Problém**: První obrázky se načítají pomalu
   - **Řešení**: Přidat `<link rel="preload">` pro první 3-5 obrázků
   - **Kde**: V `<head>` sekci `services.html`, `index.html`
   - **Příklad**: `<link rel="preload" as="image" href="URL_PRVEHO_OBRAZKU" fetchpriority="high">`

### 6. **Optimalizovat velikost výchozího obrázku**
   - **Problém**: `/fotky/vychozi-inzerat.png` může být velký
   - **Řešení**: Zkomprimovat na WebP, zmenšit rozlišení
   - **Nástroj**: TinyPNG, Squoosh, ImageOptim

### 7. **Použít srcset pro responsive obrázky**
   - **Problém**: Stejný obrázek pro mobil i desktop
   - **Řešení**: Použít `srcset` s různými velikostmi
   - **Kde**: V `createAdCard` funkci v `services.js`
   - **Příklad**: `<img srcset="small.jpg 400w, medium.jpg 800w, large.jpg 1200w" sizes="(max-width: 768px) 400px, 800px">`

### 8. **Firebase Storage - CORS optimalizace**
   - **Problém**: CORS hlavičky mohou zpomalit načítání
   - **Řešení**: Nastavit správné CORS hlavičky v Firebase Storage
   - **Kde**: Firebase Console → Storage → Rules → CORS

### 9. **Komprese obrázků na serveru**
   - **Problém**: Obrázky nejsou komprimované
   - **Řešení**: Automatická komprese při uploadu
   - **Kde**: Firebase Cloud Functions - trigger při uploadu
   - **Nástroj**: Sharp, ImageMagick

### 10. **Lazy loading s Intersection Observer vylepšení**
   - **Problém**: Intersection Observer může být pomalý
   - **Řešení**: Použít `loading="lazy"` nativní lazy loading + Intersection Observer jako fallback
   - **Kde**: Už implementováno, ale může se vylepšit threshold

### 11. **Preconnect k Firebase Storage dříve**
   - **Problém**: DNS lookup a TLS handshake při prvním načtení
   - **Řešení**: Přidat `<link rel="preconnect">` dříve v `<head>`
   - **Kde**: Už je v HTML, ale zkontrolovat pořadí

### 12. **Monitorovat výkon načítání**
   - **Problém**: Nevíte, které obrázky se načítají pomalu
   - **Řešení**: Přidat Performance API monitoring
   - **Kde**: V `services.js` - logovat dojmy o načítání
   - **Nástroj**: Chrome DevTools → Network tab, Lighthouse

### 13. **Firebase Storage - Lifecycle rules**
   - **Problém**: Staré obrázky zabírají místo
   - **Řešení**: Automatické mazání starých obrázků
   - **Kde**: Firebase Storage → Lifecycle rules

### 14. **Použít AVIF formát (pokud podporován)**
   - **Problém**: WebP není nejlepší komprese
   - **Řešení**: Přidat AVIF jako první volbu, WebP jako fallback
   - **Kde**: V `createAdCard` - přidat `<source type="image/avif">`

### 15. **Optimalizovat pořadí načítání**
   - **Problém**: Všechny obrázky se načítají najednou
   - **Řešení**: Načítat pouze obrázky v viewportu + 1 řádek před
   - **Kde**: Už implementováno s lazy loading

## 🚀 Prioritní kroky (největší dopad):

1. **Resize obrázky při uploadu** - Sníží velikost o 80-90%
2. **Service Worker cache** - Okamžité načítání při opakované návštěvě
3. **Thumbnaily** - Rychlejší načítání náhledů
4. **Preload první obrázky** - Rychlejší první dojem

## 📊 Jak měřit výkon:

1. Otevřít Chrome DevTools → Network tab
2. Zkontrolovat:
   - **Load time** - čas načtení obrázku
   - **Size** - velikost souboru
   - **Waterfall** - kdy se začal načítat
3. Použít Lighthouse pro celkové skóre
4. Sledovat Core Web Vitals (LCP - Largest Contentful Paint)

## 🔍 Debugging:

- Otevřít Console → Network tab
- Filtrovat na "Img"
- Zkontrolovat, které obrázky se načítají pomalu
- Zkontrolovat, zda se používá cache
- Zkontrolovat, zda se používá lazy loading

