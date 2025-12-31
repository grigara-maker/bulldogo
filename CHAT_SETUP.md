# Nastavení chatu - Průvodce řešením problémů

## Možné problémy a řešení

### 1. Chyba "permission-denied"

**Příčina:** Firestore rules nejsou správně nastavené nebo publikované.

**Řešení:**
1. Otevři Firebase Console: https://console.firebase.google.com/
2. Vyber projekt **inzerio-inzerce**
3. Jdi na **Firestore Database** → **Rules**
4. Zkopíruj obsah z `firestore-rules.txt`
5. Klikni na **Publish**
6. Počkej 1-2 minuty na aktivaci

### 2. Chyba "index required" nebo "failed-precondition"

**Příčina:** Chybí Firestore index pro query konverzací.

**Řešení:**
1. V konzoli prohlížeče bude odkaz na vytvoření indexu
2. Nebo jdi do Firebase Console → **Firestore Database** → **Indexes**
3. Klikni na **Create Index**
4. Nastav:
   - **Collection ID:** `chats`
   - **Fields to index:**
     - `participants` (Array, Ascending)
     - `lastAt` (Timestamp, Descending) - volitelné pro řazení
5. Klikni na **Create**
6. Počkej, až se index vytvoří (může trvat několik minut)

### 3. Chat se nenačítá

**Kontrola:**
1. Otevři konzoli prohlížeče (F12)
2. Zkontroluj, zda jsou chyby
3. Zkontroluj, zda je uživatel přihlášen
4. Zkontroluj, zda je Firebase inicializován (`window.firebaseDb`)

**Možné příčiny:**
- Uživatel není přihlášen
- Firebase není inicializován
- Firestore rules blokují přístup
- Chybí Firestore index

### 4. Nelze odeslat zprávu

**Kontrola:**
1. Zkontroluj, zda je chat otevřený
2. Zkontroluj, zda je uživatel přihlášen
3. Zkontroluj konzoli pro chyby

**Možné příčiny:**
- Chat dokument neexistuje
- Firestore rules blokují zápis
- Uživatel není účastníkem chatu

## Struktura dat v Firestore

```
chats/
  {chatId}/  (např. "uid1_uid2")
    - participants: [uid1, uid2]
    - lastMessage: "text zprávy"
    - lastAt: Timestamp
    - createdAt: Timestamp
    - listingId: "id inzerátu" (volitelné)
    - listingTitle: "název inzerátu" (volitelné)
    messages/
      {messageId}/
        - fromUid: "uid odesílatele"
        - text: "text zprávy"
        - images: []
        - createdAt: Timestamp
```

## Testování

1. Otevři `chat.html` v prohlížeči
2. Přihlas se
3. Zkus vytvořit nový chat (např. přes deep link: `chat.html?userId=UID`)
4. Zkus odeslat zprávu
5. Zkontroluj konzoli pro případné chyby

## Debugging

V konzoli prohlížeče uvidíš:
- `🔍 Spouštím listener konverzací pro UID: ...`
- `📨 Konverzace aktualizovány: X`
- `📝 Vytvářím nový chat: ...`
- `✅ Chat vytvořen: ...`
- `❌ Chyba při odesílání zprávy: ...`

Pokud vidíš chyby, zkontroluj:
1. Firestore rules jsou publikované
2. Firestore indexy jsou vytvořené
3. Uživatel je přihlášen
4. Firebase je inicializován

