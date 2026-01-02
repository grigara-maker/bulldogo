# Kontrola Firestore - Možné problémy

## 1. Firestore Security Rules
✅ **Soubor s pravidly existuje**: `firestore-rules.txt`
⚠️ **DŮLEŽITÉ**: Zkontrolujte, že jsou tato pravidla nastavená v Firebase Console:
- Firebase Console → Firestore Database → Rules → Edit
- Zkopírujte obsah z `firestore-rules.txt`

## 2. Firestore Indexy
⚠️ **Možný problém**: Některé dotazy mohou vyžadovat indexy:

### Index pro konverzace (chat):
```
Collection: conversations
Fields:
  - participants (Array)
  - lastMessageAt (Descending)
```

**Jak vytvořit index:**
1. Firebase Console → Firestore Database → Indexes
2. Klikněte na "Create Index"
3. Collection ID: `conversations`
4. Fields:
   - `participants` - Array
   - `lastMessageAt` - Descending
5. Query scope: Collection

### Index pro inzeráty (pokud používáte orderBy):
```
Collection: inzeraty (collectionGroup)
Fields:
  - status (Ascending)
  - createdAt (Descending)
```

## 3. Kontrola chyb v konzoli
Zkontrolujte v prohlížeči (F12 → Console):
- ❌ `permission-denied` - problém s pravidly
- ❌ `failed-precondition` - chybí index
- ❌ `unavailable` - problém s připojením

## 4. Stripe Firestore Extension
✅ Pravidla pro Stripe jsou v `firestore-rules.txt`:
- `/customers/{uid}/checkout_sessions` - read/write pro vlastníka
- `/products` - veřejné čtení
- `/prices` - veřejné čtení

## 5. Kontrola kolekcí
Zkontrolujte v Firebase Console, že existují tyto kolekce:
- ✅ `users/{userId}/inzeraty`
- ✅ `conversations`
- ✅ `products`
- ✅ `customers/{uid}/checkout_sessions`

## 6. Doporučené akce
1. **Zkontrolujte Firestore Rules v Console** - ujistěte se, že jsou nastavené
2. **Vytvořte indexy** - pokud vidíte chyby `failed-precondition`
3. **Zkontrolujte konzoli prohlížeče** - hledejte chyby `permission-denied` nebo `failed-precondition`
4. **Testujte v Rules simulátoru** - Firebase Console → Firestore → Rules → Rules Playground

