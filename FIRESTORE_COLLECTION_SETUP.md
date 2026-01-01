# Nastavení Firestore kolekce pro chat

## ⚠️ DŮLEŽITÉ

**NEPOTŘEBUJEŠ vytvářet kolekci ručně!** Kolekce `conversations` se vytvoří automaticky při prvním použití chatu.

## Pokud přesto chceš vytvořit testovací dokument:

### KROK 1: Zavři modal
- Klikni na **"Cancel"** v modalu "Start a collection"

### KROK 2: Vytvoř správnou kolekci
1. V Firebase Console → Firestore Database → Data
2. Klikni na **"+ Start collection"** (nebo **"Add collection"**)
3. V poli **"Collection ID"** zadej: `conversations` (ne `chats`!)
4. Klikni na **"Next"**

### KROK 3: Vytvoř první dokument
1. **Document ID:** Klikni na **"Auto-ID"** (nebo zadej vlastní ID)
2. Přidej pole:
   - **Field:** `participants`
   - **Type:** `array`
   - **Value:** `["uid1", "uid2"]` (nahraď skutečnými UID)
   
   - **Field:** `listingId`
   - **Type:** `string`
   - **Value:** `test-listing-id` (nebo nech prázdné)
   
   - **Field:** `listingTitle`
   - **Type:** `string`
   - **Value:** `Test inzerát` (nebo nech prázdné)
   
   - **Field:** `lastMessage`
   - **Type:** `string`
   - **Value:** ``
   
   - **Field:** `lastMessageAt`
   - **Type:** `timestamp`
   - **Value:** Klikni na ikonu kalendáře a vyber aktuální čas
   
   - **Field:** `createdAt`
   - **Type:** `timestamp`
   - **Value:** Klikni na ikonu kalendáře a vyber aktuální čas

3. Klikni na **"Save"**

## ✅ Doporučený postup (jednodušší)

**NEPOTŘEBUJEŠ vytvářet dokument ručně!** Stačí:

1. **Publikovat Firestore Rules** (pokud ještě nejsou publikované)
2. **Otevřít chat v aplikaci** (`chat.html`)
3. **Přihlásit se**
4. **Kliknout na tlačítko "Chat" u nějakého inzerátu**
5. Kolekce `conversations` se vytvoří automaticky!

## 📋 Struktura dokumentu v `conversations`:

```javascript
{
  participants: ["uid1", "uid2"],  // Array s 2 UID
  listingId: "id-inzeratu",        // String nebo null
  listingTitle: "Název inzerátu",  // String nebo null
  lastMessage: "Text poslední zprávy", // String
  lastMessageAt: Timestamp,        // Timestamp
  createdAt: Timestamp             // Timestamp
}
```

## ⚠️ ČASTÉ CHYBY:

1. ❌ **Vytváření kolekce `chats`** - nový systém používá `conversations`!
2. ❌ **Zapomenutí publikovat Firestore Rules** - bez toho nebude chat fungovat
3. ❌ **Špatný typ pole** - `participants` musí být `array`, ne `string`

## 🎯 Nejjednodušší řešení:

**Zavři modal a prostě použij chat v aplikaci** - vše se vytvoří automaticky! 🚀

