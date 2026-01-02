#!/bin/bash

# Skript pro automatické přidání, commit a push všech změn
# Použití: ./git-auto-push.sh "Popis změn"

# Získej popis z argumentu nebo použij výchozí
COMMIT_MESSAGE="${1:-Aktualizace všech souborů}"

echo "📦 Přidávám všechny změny..."
git add -A

echo "💾 Commituji změny: $COMMIT_MESSAGE"
git commit -m "$COMMIT_MESSAGE"

if [ $? -eq 0 ]; then
    echo "🚀 Pushuji změny na remote..."
    git push
    
    if [ $? -eq 0 ]; then
        echo "✅ Všechny změny úspěšně pushnuty!"
    else
        echo "❌ Chyba při pushování změn"
        exit 1
    fi
else
    echo "❌ Chyba při commitu (možná nejsou žádné změny)"
    exit 1
fi

