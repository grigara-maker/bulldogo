# Git Automatizace

## Automatický push po commitu

Po každém commitu se automaticky spustí push na remote repository. Stačí udělat:

```bash
git commit -m "Váš popis změn"
```

Hook automaticky pushne změny.

## Manuální spuštění

### Metoda 1: Použití skriptu

```bash
./git-auto-push.sh "Popis změn"
```

Nebo bez popisu (použije se výchozí):
```bash
./git-auto-push.sh
```

### Metoda 2: Použití git aliasu

```bash
git acp "Popis změn"
```

Nebo bez popisu:
```bash
git acp
```

## Vypnutí automatického push

Pokud chcete vypnout automatický push po commitu, přejmenujte nebo smažte soubor:
```bash
mv .git/hooks/post-commit .git/hooks/post-commit.disabled
```

Pro opětovné zapnutí:
```bash
mv .git/hooks/post-commit.disabled .git/hooks/post-commit
chmod +x .git/hooks/post-commit
```

