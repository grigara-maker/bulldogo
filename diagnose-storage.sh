#!/bin/bash

# Diagnostický script pro Firebase Storage
# Zkontroluje, zda bucket existuje a jaký má stav

echo "🔍 Diagnostika Firebase Storage"
echo "================================"
echo ""

PROJECT_ID="inzerio-inzerce"
BUCKET="inzerio-inzerce.firebasestorage.app"

echo "📦 Projekt: $PROJECT_ID"
echo "📦 Bucket: $BUCKET"
echo ""

# Zkontrolovat, zda je gcloud nainstalovaný
if ! command -v gcloud &> /dev/null; then
    echo "❌ gcloud není nainstalovaný"
    echo "   Instalace: brew install --cask google-cloud-sdk"
    echo ""
    echo "⚠️  Bez gcloud nelze diagnostikovat Storage bucket"
    echo "   Zkontroluj Firebase Console místo toho:"
    echo "   https://console.firebase.google.com/project/$PROJECT_ID/storage"
    exit 1
fi

echo "✅ gcloud je nainstalovaný"
echo ""

# Zkontrolovat přihlášení
echo "🔐 Kontroluji přihlášení..."
if ! gcloud auth list 2>/dev/null | grep -q "ACTIVE"; then
    echo "❌ Nejsi přihlášený do Google Cloud"
    echo ""
    echo "Přihlas se pomocí:"
    echo "  gcloud auth login"
    echo ""
    read -p "Chceš se přihlásit teď? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        gcloud auth login
        if [ $? -ne 0 ]; then
            echo "❌ Přihlášení selhalo"
            exit 1
        fi
    else
        exit 1
    fi
fi

ACTIVE_ACCOUNT=$(gcloud auth list --filter=status:ACTIVE --format="value(account)" 2>/dev/null)
echo "✅ Přihlášen jako: $ACTIVE_ACCOUNT"
echo ""

# Nastavit projekt
echo "🔧 Nastavuji projekt..."
gcloud config set project $PROJECT_ID 2>/dev/null
echo ""

# Zkontrolovat, zda bucket existuje
echo "📦 Kontroluji, zda bucket existuje..."
if gsutil ls -b "gs://$BUCKET" &> /dev/null; then
    echo "✅ Bucket existuje!"
    echo ""
    
    # Získat informace o bucketu
    echo "📋 Informace o bucketu:"
    gsutil ls -L -b "gs://$BUCKET" 2>/dev/null || echo "⚠️  Nelze získat detaily bucketu"
    echo ""
    
    # Zkontrolovat CORS
    echo "🌐 CORS konfigurace:"
    CORS_CONFIG=$(gsutil cors get "gs://$BUCKET" 2>/dev/null)
    if [ -z "$CORS_CONFIG" ] || [ "$CORS_CONFIG" == "[]" ]; then
        echo "❌ CORS není nakonfigurovaný!"
        echo ""
        echo "🔧 Aplikuj CORS pomocí:"
        echo "   ./apply-cors.sh"
        echo ""
    else
        echo "✅ CORS je nakonfigurovaný:"
        echo "$CORS_CONFIG"
        echo ""
    fi
    
    # Zkontrolovat práva
    echo "🔐 Kontroluji přístupová práva..."
    IAM_POLICY=$(gsutil iam get "gs://$BUCKET" 2>/dev/null)
    if [ -n "$IAM_POLICY" ]; then
        echo "✅ IAM policy získána"
        echo ""
    else
        echo "⚠️  Nelze získat IAM policy"
        echo ""
    fi
    
    # Zkontrolovat, zda můžeme vytvořit testovací soubor
    echo "🧪 Testuji zápis do bucketu..."
    TEST_FILE="/tmp/firebase-storage-test-$(date +%s).txt"
    echo "Test file created at $(date)" > "$TEST_FILE"
    
    if gsutil cp "$TEST_FILE" "gs://$BUCKET/test/test.txt" 2>/dev/null; then
        echo "✅ Zápis do bucketu funguje!"
        gsutil rm "gs://$BUCKET/test/test.txt" 2>/dev/null
        rm "$TEST_FILE" 2>/dev/null
        echo ""
    else
        echo "❌ Zápis do bucketu selhal!"
        rm "$TEST_FILE" 2>/dev/null
        echo ""
        echo "Možné příčiny:"
        echo "  1. Nemáš práva pro zápis do bucketu"
        echo "  2. Bucket je v nesprávném stavu"
        echo "  3. Billing není aktivní"
        echo ""
    fi
    
else
    echo "❌ Bucket neexistuje nebo k němu nemáš přístup!"
    echo ""
    echo "🔧 Co dělat:"
    echo "  1. Zkontroluj Firebase Console:"
    echo "     https://console.firebase.google.com/project/$PROJECT_ID/storage"
    echo ""
    echo "  2. Pokud Storage není aktivní, aktivuj ho:"
    echo "     - Klikni na Storage v levém menu"
    echo "     - Klikni Get Started"
    echo "     - Vyber Production mode"
    echo "     - Vyber lokaci europe-central2"
    echo ""
    echo "  3. Zkontroluj, zda je aktivní billing:"
    echo "     https://console.cloud.google.com/billing/linkedaccount?project=$PROJECT_ID"
    echo ""
fi

# Zkontrolovat Firebase projekt
echo "🔥 Kontroluji Firebase projekt..."
if command -v firebase &> /dev/null; then
    firebase projects:list 2>/dev/null | grep -q "$PROJECT_ID"
    if [ $? -eq 0 ]; then
        echo "✅ Firebase projekt nalezen"
        echo ""
    else
        echo "⚠️  Firebase projekt nenalezen v seznamu"
        echo ""
    fi
else
    echo "⚠️  Firebase CLI není nainstalovaný"
    echo "   Instalace: npm install -g firebase-tools"
    echo ""
fi

# Souhrn
echo "================================"
echo "📊 SOUHRN DIAGNOSTIKY"
echo "================================"
echo ""
echo "Zkontroluj tyto věci v Firebase Console:"
echo "  🔗 Storage: https://console.firebase.google.com/project/$PROJECT_ID/storage"
echo "  🔗 Billing: https://console.cloud.google.com/billing/linkedaccount?project=$PROJECT_ID"
echo "  🔗 Usage: https://console.firebase.google.com/project/$PROJECT_ID/usage"
echo ""
echo "Pokud bucket neexistuje nebo vidíš chybu 404:"
echo "  1. Storage může být deaktivovaný"
echo "  2. Bucket může být smazaný"
echo "  3. Billing může být vypnutý"
echo "  4. Dosáhl jsi kvótu free tieru"
echo ""

