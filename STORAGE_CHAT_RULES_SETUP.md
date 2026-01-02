# Nastavení Firebase Storage pravidel pro chat obrázky

## Problém
Při nahrávání obrázků v chatu se zobrazuje chyba:
```
Firebase Storage: User does not have permission to access 'chat/...'. (storage/unauthorized)
```

## Řešení

### ✅ Krok 1: Nastav Storage Rules v Firebase Console

1. Otevři [Firebase Console](https://console.firebase.google.com/)
2. Vyber projekt **inzerio-inzerce**
3. V levém menu klikni na **Storage** (ikona složky)
4. Klikni na záložku **Rules**
5. Zkopíruj a vlož **CELÝ** obsah ze souboru `storage-rules.txt`:

```javascript
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
    
    // Povolit přihlášeným uživatelům nahrávat obrázky do chatu
    // Cesta: chat/{conversationId}/{timestamp}_{filename}
    match /chat/{conversationId}/{allPaths=**} {
      // Každý přihlášený uživatel může číst obrázky z konverzací
      allow read: if request.auth != null;
      
      // Každý přihlášený uživatel může nahrávat obrázky do konverzací
      allow write: if request.auth != null;
    }
    
    // Výchozí: zakázat přístup
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

6. Klikni na **Publish** (Publikovat)

### ✅ Krok 2: Ověř, že pravidla jsou aktivní

1. V Firebase Console → Storage → Rules
2. Zkontroluj, že se pravidla zobrazují správně
3. Měl by být zelený indikátor "Published" (Publikováno)

### ✅ Krok 3: Testování

1. Obnov stránku chatu v prohlížeči
2. Zkus nahrát obrázek v chatu
3. Chyba by měla zmizet a obrázek by se měl úspěšně nahrát

## Poznámky

- **Pravidla pro chat**: Každý přihlášený uživatel může nahrávat a číst obrázky z jakékoli konverzace. Toto je v pořádku, protože přístup ke konverzacím je již kontrolován přes Firestore Security Rules.

- **Bezpečnost**: Obrázky v chatu jsou dostupné pouze přihlášeným uživatelům. Firestore pravidla zajišťují, že uživatel vidí pouze konverzace, ve kterých je účastníkem.

