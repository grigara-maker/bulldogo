# Diagnostika problému s načítáním obrázků

## Problém

V databázi je URL s názvem `1767547657366_preview.jpg`, ale ve Firebase Storage Console je soubor uložený jako `1767547657366_preview_200x200.jpg`.

## Možné příčiny

1. **Firebase Storage Extension** - Automaticky resizeuje obrázky a přidává `_200x200` k názvu souboru
2. **Cloud Function** - Resizeuje obrázky a přidává `_200x200`
3. **Nesoulad mezi ref a skutečným souborem** - `getDownloadURL()` vrací URL na původní soubor, ale skutečný soubor má `_200x200`

## Co zkontrolovat

1. **Firebase Console → Extensions** - Zkontrolovat, zda je nainstalována "Resize Images" extension
2. **Firebase Console → Functions** - Zkontrolovat, zda existuje Cloud Function, která resizeuje obrázky
3. **Logy z uploadu** - Zkontrolovat logy v konzoli při uploadu (zejména `previewSnapshot.ref.fullPath` a `getDownloadURL()`)

## Řešení

### Varianta 1: Firebase Storage Extension

Pokud je nainstalována "Resize Images" extension:
- Extension vytváří resize verze obrázků s `_200x200` příponou
- `getDownloadURL()` vrací URL na původní soubor (bez `_200x200`)
- **Řešení**: Použít resize verzi, nebo vypnout extension

### Varianta 2: Upravit kód

Pokud se soubor ukládá s `_200x200`, upravit kód tak, aby:
1. Zkontroloval, zda soubor existuje s původním názvem
2. Pokud ne, zkusil variantu s `_200x200`
3. Uložil správnou URL do databáze

### Varianta 3: Vypnout automatický resize

Pokud není potřeba automatický resize:
- Vypnout Firebase Storage Extension
- Nebo upravit konfiguraci extension tak, aby se soubory ukládaly bez `_200x200`

