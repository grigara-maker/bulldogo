# Prompt pro Claude Code - Oprava problému s načítáním obrázků

## Kontext projektu

Webová aplikace pro inzeráty/služby (Bulldogo.cz):
- **Stack**: Čistý HTML/CSS/JavaScript (bez frameworku) + Firebase (Firestore + Storage)
- **Hlavní soubory**: `auth.js` (upload obrázků), `create-ad.js` (ořez obrázků), `services.js`, `ad-detail.js`, `profile-detail.js`, `top-manage.js` (zobrazení obrázků)

## Popis problému

**Problém**: Obrázky inzerátů se nezobrazují kvůli nesouladu mezi názvem souboru ve Firebase Storage a URL v databázi.

**Co se děje**:
1. Při uploadu se vytvoří cesta: `services/${userId}/${Date.now()}_preview.jpg`
2. Soubor se nahrává do Firebase Storage pomocí `uploadBytes(previewRef, serviceData.previewImage)`
3. URL se získává pomocí `getDownloadURL(previewSnapshot.ref)` a uloží do Firestore
4. **PROBLÉM**: V databázi je URL s názvem `1767547657366_preview.jpg`, ale ve Storage je soubor uložený jako `1767547657366_preview_200x200.jpg`
5. Při načítání obrázku dostáváme 404 chybu, protože soubor s názvem z databáze neexistuje

## Úkol

**Opravit root cause problému** - zajistit, aby URL v databázi odpovídala skutečnému názvu souboru ve Storage.

## Soubory k analýze

1. **`auth.js`** - funkce `addService` (řádek ~2019-2030)
   - Vytváří cestu: `const fileName = 'services/${authCurrentUser.uid}/${Date.now()}_preview.jpg'`
   - Nahrává: `uploadBytes(previewRef, serviceData.previewImage)`
   - Získává URL: `getDownloadURL(previewSnapshot.ref)`

2. **`create-ad.js`** - funkce `confirmImageCrop` (řádek ~691-777)
   - Ořezává obrázek pomocí Cropper.js
   - Vytváří File objekt: `new File([blob], 'cropped-${Date.now()}.jpg', {type: 'image/jpeg'})`
   - Nastavuje do inputu pomocí DataTransfer API

## Možné příčiny

1. Firebase Storage Extension automaticky přidává `_200x200` k názvu souboru
2. Cloud Function resizeuje obrázky a přidává `_200x200`
3. Někde v kódu se přidává `_200x200` k názvu souboru před uploadem

## Požadované řešení

**Varianta A** (preferovaná): Zjistit, proč se soubor ukládá s `_200x200`, a upravit kód tak, aby se do databáze ukládala správná URL (s `_200x200` pokud se soubor takto ukládá).

**Varianta B**: Pokud je to nějaký automatický resize mechanismus, vypnout ho nebo upravit upload tak, aby se soubor ukládal bez `_200x200`.

**Důležité**: Aktuálně existuje workaround v souborech `services.js`, `ad-detail.js`, `profile-detail.js`, `top-manage.js`, který zkouší variantu s `_200x200` při chybě 404. Toto je dočasné řešení - potřebujeme opravit root cause.

## Konkrétní kroky

1. Prozkoumat kód v `auth.js` - funkce `addService`, zejména část uploadu obrázku
2. Zkontrolovat, zda se někde přidává `_200x200` k názvu souboru
3. Zkontrolovat logy v konzoli - zjistit skutečnou cestu po uploadu (pomocí `previewSnapshot.ref.fullPath`)
4. Upravit kód tak, aby URL v databázi odpovídala skutečnému názvu souboru ve Storage
5. Otestovat - vytvořit nový inzerát a zkontrolovat, zda se obrázek zobrazuje

## Testování

Po opravě:
- Vytvořit nový inzerát s obrázkem
- Zkontrolovat Firebase Storage Console - název souboru
- Zkontrolovat Firestore databázi - URL v `images[0].url`
- Ověřit, že URL v databázi odpovídá skutečnému názvu souboru
- Ověřit, že se obrázek zobrazuje na stránce

