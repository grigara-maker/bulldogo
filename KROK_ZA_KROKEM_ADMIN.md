# Krok za krokem: Vytvoření Admin Profilu v Firestore

## Admin údaje:
- **Email**: admin@bulldogo.cz
- **UID**: c8eMk8gNI9RZzLWucfBWRu8gYx42

---

## KROK 1: Vytvořit root dokument uživatele

1. V Firebase Console jdi na **Firestore Database**
2. Klikni na **"Start collection"** nebo **"Add document"** (pokud je databáze prázdná)
3. **Collection ID**: zadej `users`
4. **Document ID**: zadej `c8eMk8gNI9RZzLWucfBWRu8gYx42`
5. Přidej pole:

   | Field | Type | Value |
   |-------|------|-------|
   | `uid` | string | `c8eMk8gNI9RZzLWucfBWRu8gYx42` |
   | `email` | string | `admin@bulldogo.cz` |
   | `createdAt` | timestamp | Klikni na ikonu hodin a vyber "Set to now" |

6. Klikni **"Save"**

---

## KROK 2: Vytvořit subkolekci "profile"

1. Klikni na dokument `c8eMk8gNI9RZzLWucfBWRu8gYx42`, který jsi právě vytvořil
2. V dolní části klikni na **"Start collection"** (nebo **"Add subcollection"**)
3. **Collection ID**: zadej `profile`
4. Klikni **"Next"**

---

## KROK 3: Vytvořit dokument "profile" v subkolekci

1. **Document ID**: zadej `profile` (přesně takto, malými písmeny)
2. Přidej pole (klikni **"Add field"** pro každé):

   | Field | Type | Value |
   |-------|------|-------|
   | `isAdmin` | boolean | `true` (zaškrtni checkbox) |
   | `role` | string | `admin` |
   | `email` | string | `admin@bulldogo.cz` |
   | `name` | string | `Admin` |
   | `balance` | number | `0` |
   | `rating` | number | `0` |
   | `totalReviews` | number | `0` |
   | `totalAds` | number | `0` |
   | `activeAds` | number | `0` |
   | `totalViews` | number | `0` |
   | `totalContacts` | number | `0` |
   | `emailNotifications` | boolean | `true` |
   | `smsNotifications` | boolean | `false` |
   | `marketingEmails` | boolean | `false` |
   | `createdAt` | timestamp | Klikni na ikonu hodin a vyber "Set to now" |

3. Klikni **"Save"**

---

## KROK 4: Ověření

1. Struktura by měla vypadat takto:
   ```
   users/
     └── c8eMk8gNI9RZzLWucfBWRu8gYx42/
         ├── (root dokument s uid, email, createdAt)
         └── profile/
             └── profile/
                 └── (dokument s isAdmin, role, email, name, atd.)
   ```

2. Přihlas se na web jako `admin@bulldogo.cz`
3. V sidebaru by se měla zobrazit sekce **ADMIN** se zlatými odkazy

---

## Alternativa: Použít Firebase Function (automatické)

Pokud nechceš ručně vytvářet dokumenty, můžeš použít Firebase Function:

1. Deployni funkci:
   ```bash
   cd functions
   npm run build
   firebase deploy --only functions:setAdminStatus
   ```

2. Zavolej funkci (v prohlížeči):
   ```
   https://europe-west1-inzerio-inzerce.cloudfunctions.net/setAdminStatus?uid=c8eMk8gNI9RZzLWucfBWRu8gYx42
   ```

   Funkce automaticky vytvoří oba dokumenty s všemi potřebnými poli!

---

## Tipy:

- **Boolean hodnoty**: Zaškrtni checkbox pro `true`, nezaškrtni pro `false`
- **Timestamp**: Klikni na ikonu hodin 📅 a vyber "Set to now"
- **Number**: Zadej číslo bez uvozovek
- **String**: Zadej text v uvozovkách (Firebase Console je přidá automaticky)

