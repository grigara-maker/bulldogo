# Řešení problému s Firebase Storage Extension "Resize Images"

## Problém

Firebase Storage Extension "Resize Images" automaticky resizeuje obrázky na 200x200px a přidává `_200x200` k názvu souboru.

## Možnosti řešení

### Varianta 1: Smazat/Vypnout Extension (DOPORUČENO pro inzeráty)

**Proč:**
- 200x200px je příliš malé pro obrázky inzerátů
- Obrázky budou ve vyšší kvalitě
- Kód bude jednodušší (bez workaroundů)
- Pro inzeráty je vhodnější větší rozlišení (800x600px nebo 1200x900px)

**Jak:**
1. Firebase Console → Extensions
2. Najít "Resize Images" extension
3. Kliknout na "Delete" nebo "Uninstall"

**Po smazání:**
- Obrázky se budou ukládat v původní velikosti
- URL v databázi bude odpovídat skutečnému souboru
- Workaround s `_200x200` už nebude potřeba (ale může zůstat jako fallback)

### Varianta 2: Upravit kód, aby používal resize verzi

Pokud chceš zachovat resize na 200x200px:

1. Upravit kód v `auth.js` tak, aby URL obsahovala `_200x200`:
   ```javascript
   const previewUrl = await getDownloadURL(previewSnapshot.ref);
   // Pokud extension vytváří resize verzi, použít ji
   const resizedUrl = previewUrl.replace('_preview.jpg', '_preview_200x200.jpg');
   ```

**Nevýhody:**
- Obrázky budou velmi malé (200x200px)
- Horší kvalita pro zobrazení detailů
- Nutnost upravit kód

### Varianta 3: Upravit Extension konfiguraci

Pokud extension podporuje konfiguraci:
- Zkontrolovat, zda lze změnit velikost resize (např. na 800x600px)
- Zkontrolovat, zda lze vypnout resize pro určité cesty (`services/**`)

## Doporučení

**Pro obrázky inzerátů: Smazat extension**

Důvody:
1. 200x200px je příliš malé pro inzeráty
2. Uživatelé potřebují vidět detail obrázku
3. Kód bude jednodušší
4. Obrázky budou v lepší kvalitě

**Pokud potřebuješ resize pro jiné části aplikace:**
- Použít resize pouze pro avatary (např. `profile/**`)
- Nebo resizeovat obrázky před uploadem v kódu (např. pomocí canvas)

## Po smazání extension

1. Kód už nebude potřebovat workaround s `_200x200`
2. URL v databázi bude odpovídat skutečnému souboru
3. Obrázky se budou ukládat v původní velikosti
4. Pro optimalizaci lze resizeovat obrázky před uploadem (v `create-ad.js` pomocí canvas)

