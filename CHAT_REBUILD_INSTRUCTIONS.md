# Instrukce pro nový chat systém

## ✅ Co bylo změněno

1. **Smazán starý chat systém** - kompletně přepsán
2. **Nová struktura Firestore:**
   - `conversations/{conversationId}` místo `chats/{chatId}`
   - `conversations/{conversationId}/messages/{messageId}` místo `chats/{chatId}/messages/{messageId}`
3. **Nové Firestore rules** - jednodušší a bezpečnější
4. **Chat pouze pro přihlášené** - žádné dotazy bez auth
5. **3-sloupcový layout:**
   - Levý panel: seznam konverzací
   - Střed: chat okno
   - Pravý panel: nejnovější inzeráty

## 🔥 DŮLEŽITÉ: Publikování Firestore Rules

### KROK 1: Otevři Firebase Console
1. Jdi na: https://console.firebase.google.com/
2. Vyber projekt: **bulldogo-tryout** (nebo **inzerio-inzerce**)

### KROK 2: Otevři Firestore Rules
1. V levém menu klikni na **Firestore Database**
2. Klikni na záložku **Rules** (vedle "Data", "Indexes")

### KROK 3: Zkopíruj a vlož pravidla
1. Otevři soubor `firestore-rules.txt` v projektu
2. Zkopíruj **CELÝ OBSAH** (včetně komentářů)
3. Vlož do editoru pravidel v Firebase Console

### KROK 4: Publikuj
1. **DŮLEŽITÉ:** Klikni na tlačítko **"Publish"** (ne jen "Save" nebo "Validate")
2. Počkej 1-2 minuty, než se pravidla aktivují

## 📊 Vytvoření Firestore Indexu

Pokud uvidíš chybu "index required" nebo "failed-precondition":

1. V konzoli prohlížeče bude odkaz na vytvoření indexu - klikni na něj
2. Nebo jdi do Firebase Console → **Firestore Database** → **Indexes**
3. Klikni na **Create Index**
4. Nastav:
   - **Collection ID:** `conversations`
   - **Fields to index:**
     - `participants` (Array, Ascending)
     - `lastMessageAt` (Timestamp, Descending)
5. Klikni na **Create**
6. Počkej, až se index vytvoří (může trvat několik minut)

## 🧪 Testování

1. Otevři `chat.html` v prohlížeči
2. Přihlas se
3. Zkus vytvořit nový chat (např. přes tlačítko "Chat" u inzerátu)
4. Zkus odeslat zprávu
5. Zkontroluj konzoli pro případné chyby

## 📋 Struktura dat v Firestore

```
conversations/
  {conversationId}/
    - participants: [uid1, uid2]
    - listingId: string (volitelné)
    - listingTitle: string (volitelné)
    - lastMessage: string
    - lastMessageAt: timestamp
    - createdAt: timestamp
    messages/
      {messageId}/
        - senderId: string
        - text: string
        - createdAt: timestamp
```

## 🔐 Bezpečnost

- ✅ Chat existuje pouze pro přihlášené uživatele
- ✅ Žádné dotazy do Firestore bez auth
- ✅ Přístup pouze pro účastníky konverzace
- ✅ Zprávy může odeslat pouze přihlášený uživatel
- ✅ Žádné globální `allow read, write: true`

## 🐛 Debugging

V konzoli prohlížeče uvidíš:
- `💬 Nový chat systém: inicializace`
- `🚀 Inicializace chatu...`
- `📨 Konverzace aktualizovány: X`
- `❌ Chyba při...` (pokud něco selže)

Pokud vidíš chyby:
1. Zkontroluj, že Firestore rules jsou publikované
2. Zkontroluj, že Firestore indexy jsou vytvořené
3. Zkontroluj, že uživatel je přihlášen
4. Zkontroluj, že Firebase je inicializován

## 🔄 Migrace ze starého systému

Starý systém používal `chats`, nový používá `conversations`. Pokud máš data ve starém formátu:
- Stará data zůstanou v `chats` kolekci
- Nové konverzace se budou ukládat do `conversations`
- Pro migraci dat je potřeba vytvořit Firebase Function nebo skript

