# Nastavení odesílání faktur

## Přehled

Po úspěšné platbě se automaticky odesílá faktura:
- **Uživateli** na jeho email (z profilu nebo z platby)
- **Účetní** na nastavený email (pokud je nastavený)

## Nastavení emailu pro účetní

### Metoda 1: Pomocí Firebase Functions Config (doporučeno)

```bash
cd functions
firebase functions:config:set accounting.email="ucetni@bulldogo.cz"
firebase deploy --only functions
```

### Metoda 2: Přímá úprava v kódu

Pokud nechcete používat config, můžete upravit přímo v souboru `functions/src/index.ts`:

Najděte řádek:
```typescript
const accountingEmail = functions.config().accounting?.email || "ucetni@bulldogo.cz";
```

A změňte výchozí email:
```typescript
const accountingEmail = functions.config().accounting?.email || "vas-email@bulldogo.cz";
```

## Co se odesílá

### Faktura obsahuje:
- Číslo faktury (číslo objednávky)
- Datum vystavení
- Údaje dodavatele (BULLDOGO.CZ)
- Údaje odběratele (uživatel)
- Položky (balíček, cena)
- Celková částka
- Platební údaje

### Formát
- HTML email s profesionálním designem
- Textová verze jako fallback

## Firebase Extension (volitelné)

Pokud chcete použít Firebase Extension pro odesílání emailů místo SMTP:

1. Nainstalujte extension "Trigger Email" z Firebase Console
2. Upravte kód, aby místo `smtpTransporter.sendMail()` používal Firestore trigger

## Testování

Pro testování faktur:
1. Proveďte testovací platbu
2. Zkontrolujte email uživatele
3. Zkontrolujte email účetní (pokud je nastavený)

## Poznámky

- Faktury se odesílají automaticky po úspěšné platbě (stav "PAID")
- Pokud uživatel nemá email, faktura se neodešle (zaloguje se varování)
- Faktury se odesílají pouze jednou (při aktivaci plánu)

