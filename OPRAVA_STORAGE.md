# Oprava Firebase Storage - Chyba 404

## Problém
Storage není aktivovaný v Firebase projektu, proto dostáváš chybu 404 při nahrávání obrázků.

## Řešení

### ✅ Krok 1: Aktivuj Storage v Firebase Console (NEJDŮLEŽITĚJŠÍ!)

1. Otevři [Firebase Console](https://console.firebase.google.com/)
2. Vyber projekt **inzerio-inzerce**
3. V levém menu klikni na **Storage** (ikona složky)
4. Klikni na **Get Started** nebo **Začít**
5. Vyber režim:
   - **Production mode** (doporučeno)
6. Vyber lokaci:
   - **europe-central2** (Praha) nebo
   - **europe-west1** (Belgie)
7. Klikni na **Done**

⚠️ **DŮLEŽITÉ**: Bez tohoto kroku Storage nebude fungovat!

### ✅ Krok 2: Nastav Storage Rules

1. V Firebase Console → Storage klikni na záložku **Rules**
2. Zkopíruj a vlož tato pravidla:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Povolit přihlášeným uživatelům nahrávat obrázky do jejich složek
    match /services/{userId}/{allPaths=**} {
      // Každý může číst obrázky
      allow read: if true;
      
      // Pouze vlastník (userId odpovídá UID) může nahrávat a upravovat
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Výchozí: zakázat přístup
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

3. Klikni na **Publish**

### ✅ Krok 3: Ověř Storage konfiguraci

Po aktivaci Storage zkontroluj v Firebase Console:

1. Storage → Files
   - Měl by se zobrazit prázdný bucket: `gs://inzerio-inzerce.firebasestorage.app`

2. Storage → Rules
   - Měla by být aktivní pravidla z Kroku 2

### 🔧 Krok 4: (Volitelné) Aplikuj CORS konfiguraci

**Pokud bude stále problém s CORS**, potřebuješ Google Cloud SDK:

#### 4.1 Instalace Google Cloud SDK (pokud nemáš)

Mac:
```bash
brew install --cask google-cloud-sdk
```

Nebo stáhni z: https://cloud.google.com/sdk/docs/install

#### 4.2 Přihlášení do Google Cloud

```bash
gcloud auth login
gcloud config set project inzerio-inzerce
```

#### 4.3 Aplikace CORS

Spusť připravený script:

```bash
cd /Users/adam/Desktop/Bulldogo8
./apply-cors.sh
```

Nebo manuálně:

```bash
gsutil cors set cors.json gs://inzerio-inzerce.firebasestorage.app
```

#### 4.4 Ověření CORS

```bash
gsutil cors get gs://inzerio-inzerce.firebasestorage.app
```

## Testování

Po dokončení všech kroků:

1. Obnovit stránku **create-ad.html**
2. Přihlásit se
3. Vytvořit inzerát **s fotkou**
4. Zkontrolovat v konzoli, že se obrázek nahrál bez chyby 404

## Očekávaný výstup v konzoli

```
✅ Firebase Storage inicializován
📸 Nahrávám náhledový obrázek...
📍 Cesta k souboru: services/fXF5xLgpOxbs2eW3hY6nV7gvMoh2/1764838012811_preview.jpg
📤 Začínám nahrávání...
✅ Upload úspěšný, získávám URL...
✅ Náhledový obrázek nahrán: https://firebasestorage.googleapis.com/...
```

## Časté problémy

### Problém: Stále chyba 404
**Řešení**: Ujisti se, že Storage je aktivovaný v Firebase Console (Krok 1)

### Problém: Permission denied
**Řešení**: Zkontroluj Storage Rules (Krok 2)

### Problém: CORS error
**Řešení**: Aplikuj CORS konfiguraci (Krok 4)

### Problém: "Storage bucket není nakonfigurovaný"
**Řešení**: Zkontroluj `firebase-init.js`, že obsahuje:
```javascript
storageBucket: "inzerio-inzerce.firebasestorage.app",
```

## Ověření konfigurace

### 1. Firebase konfigurace (firebase-init.js)

```javascript
const firebaseConfig = {
    apiKey: "AIzaSyA1FEmsY458LLKQLGcUaOVXsYr3Ii55QeQ",
    authDomain: "inzerio-inzerce.firebaseapp.com",
    projectId: "inzerio-inzerce",
    storageBucket: "inzerio-inzerce.firebasestorage.app", // ✅ MUSÍ BÝT
    messagingSenderId: "262039290071",
    appId: "1:262039290071:web:30af0eb1c65cd75e307092",
    measurementId: "G-7VD0ZE08M3"
};
```

### 2. Storage inicializace (firebase-init.js)

```javascript
storage = getStorage(app);
console.log('✅ Firebase Storage inicializován', {
    bucket: app.options.storageBucket || 'není nastaven',
    storage: !!storage
});
```

## Hotovo! 🎉

Po dokončení všech kroků by mělo nahrávání obrázků fungovat bez problémů.

