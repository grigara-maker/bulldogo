# DŮLEŽITÉ: Publikování Firestore Rules

## Problém: permission-denied chyby

Pokud vidíš chyby "permission-denied" v chatu, je to pravděpodobně proto, že **Firestore rules nejsou publikované** v Firebase Console.

## KROK ZA KROKEM:

### 1. Otevři Firebase Console
- Jdi na: https://console.firebase.google.com/
- Vyber projekt: **bulldogo-tryout** (nebo **inzerio-inzerce**)

### 2. Otevři Firestore Rules
- V levém menu klikni na **Firestore Database**
- Klikni na záložku **Rules** (vedle "Data", "Indexes", atd.)

### 3. Zkopíruj pravidla
- Otevři soubor `firestore-rules.txt` v projektu
- Zkopíruj **CELÝ OBSAH** (včetně komentářů)
- Vlož do editoru pravidel v Firebase Console

### 4. Publikuj pravidla
- **DŮLEŽITÉ:** Klikni na tlačítko **"Publish"** (ne jen "Save" nebo "Validate")
- Počkej 1-2 minuty, než se pravidla aktivují

### 5. Ověření
- Obnov stránku s chatem (Ctrl+Shift+R nebo Cmd+Shift+R)
- Zkontroluj konzoli prohlížeče - chyby by měly zmizet

## Pokud stále vidíš chyby:

1. **Zkontroluj, že jsi klikl na "Publish"** (ne jen uložil)
2. **Počkej 2-3 minuty** (pravidla se aktivují s malým zpožděním)
3. **Zkontroluj, že jsi přihlášen** v aplikaci
4. **Zkontroluj konzoli** pro detailní chyby

## Testování pravidel:

Po publikování by mělo fungovat:
- ✅ Vytváření nových chatů
- ✅ Čtení existujících chatů (pokud jsi účastník)
- ✅ Odesílání zpráv
- ✅ Aktualizace lastMessage a lastAt

## Pokud máš problémy s syntaxí:

Firebase Console automaticky validuje pravidla před publikováním. Pokud vidíš chybu validace:
- Zkontroluj, že jsi zkopíroval celý obsah včetně `rules_version = '2';` na začátku
- Zkontroluj, že všechny závorky jsou správně uzavřené

