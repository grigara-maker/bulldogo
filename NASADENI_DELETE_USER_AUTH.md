# Nasazení Cloud Function deleteUserAuth

## Problém
Chyba 404 při volání `deleteUserAuth` - funkce není nasazena.

## Řešení

### 1. Zkontrolujte, že jste v adresáři functions
```bash
cd functions
```

### 2. Nainstalujte závislosti (pokud ještě nejsou)
```bash
npm install
```

### 3. Nasaďte funkci
```bash
firebase deploy --only functions:deleteUserAuth
```

### 4. Ověřte nasazení
Po nasazení byste měli vidět výstup podobný:
```
✔  functions[deleteUserAuth(europe-west1)] Successful create operation.
Function URL (deleteUserAuth): https://europe-west1-inzerio-inzerce.cloudfunctions.net/deleteUserAuth
```

### 5. Alternativně nasaďte všechny funkce
Pokud chcete nasadit všechny funkce najednou:
```bash
firebase deploy --only functions
```

## Ověření
Po nasazení zkuste znovu smazat uživatele z admin panelu. Mělo by to fungovat bez chyby 404.

## Poznámka
Funkce je již vytvořena v `functions/src/index.ts` a je exportována jako `deleteUserAuth`. Stačí ji jen nasadit pomocí Firebase CLI.

