#!/bin/bash

# Script pro aplikaci CORS na Firebase Storage bucket

echo "🔧 Aplikuji CORS na Firebase Storage bucket..."
echo ""
echo "ℹ️  DŮLEŽITÉ: Ujisti se, že máš nainstalovaný Google Cloud SDK (gcloud)"
echo "   Pokud ne, nainstaluj ho: https://cloud.google.com/sdk/docs/install"
echo ""

# Bucket name z Firebase konfigurace
BUCKET="inzerio-inzerce.firebasestorage.app"

echo "📦 Bucket: gs://$BUCKET"
echo ""

# Zkontrolovat, zda je uživatel přihlášený
if ! gcloud auth list 2>/dev/null | grep -q "ACTIVE"; then
    echo "⚠️  Nejsi přihlášený do Google Cloud"
    echo "   Spusť: gcloud auth login"
    echo "   Pak spusť tento script znovu"
    exit 1
fi

# Zkontrolovat, zda existuje cors.json
if [ ! -f "cors.json" ]; then
    echo "❌ Soubor cors.json nenalezen"
    exit 1
fi

echo "✅ Soubor cors.json nalezen"
echo ""

# Aplikovat CORS
echo "🚀 Aplikuji CORS na bucket..."
if gsutil cors set cors.json "gs://$BUCKET"; then
    echo ""
    echo "✅ CORS úspěšně aplikován!"
    echo ""
    echo "📋 Ověření CORS konfigurace:"
    gsutil cors get "gs://$BUCKET"
else
    echo ""
    echo "❌ Chyba při aplikaci CORS"
    echo "   Ujisti se, že:"
    echo "   1. Firebase Storage je aktivovaný v Firebase Console"
    echo "   2. Máš práva na projekt inzerio-inzerce"
    exit 1
fi
