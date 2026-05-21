# 💰 Haushaltsbuch App

Eine private Haushaltsbuch-App für iPhone & iPad, entwickelt mit React Native (Expo) und Supabase.

> **Nur zum privaten Gebrauch — Erstellt von Enno.W**

---

## ✨ Funktionen

| Feature | Beschreibung |
|---------|-------------|
| 📊 Dashboard | Monatsübersicht, Kontostand, Ausgaben-Diagramm |
| 💸 Buchungen | Einnahmen & Ausgaben erfassen, suchen, filtern |
| 🔄 Fixkosten | Wiederkehrende Buchungen (monatlich, wöchentlich, jährlich) |
| 🎯 Sparziele | Ziele anlegen und Fortschritt tracken |
| 👥 2 Personen | Gemeinsamer Haushalt via Haushaltscode — Echtzeit-Sync |
| ⚙️ Einstellungen | Personen umbenennen, Farben, eigene Kategorien |

---

## 🛠 Tech Stack

- **React Native** mit [Expo](https://expo.dev) SDK 54
- **Supabase** — Datenbank & Echtzeit-Synchronisation
- **React Navigation** — Tab & Stack Navigation
- **AsyncStorage** — Lokale Speicherung des Haushaltscodes
- **react-native-chart-kit** — Diagramme

---

## 🚀 Installation & Setup

### 1. Voraussetzungen

- [Node.js](https://nodejs.org) (v18 oder neuer)
- [Expo Go](https://expo.dev/go) App auf iPhone/iPad
- Kostenloses [Supabase](https://supabase.com) Konto
- Kostenloses [Expo](https://expo.dev) Konto

---

### 2. Repository klonen

```bash
git clone https://github.com/DEIN_USERNAME/haushaltsbuch-app.git
cd haushaltsbuch-app
```

---

### 3. Abhängigkeiten installieren

```bash
npm install
```

---

### 4. Supabase einrichten

#### 4.1 Projekt erstellen
1. Gehe zu [supabase.com](https://supabase.com) → **New Project**
2. Projekt benennen und erstellen

#### 4.2 Datenbank aufsetzen
1. Im Supabase Dashboard → **SQL Editor** → **New query**
2. Folgenden SQL-Code einfügen und auf **Run** klicken:

```sql
create table households (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  created_at timestamptz default now()
);

create table persons (
  id text primary key,
  household_id uuid references households(id) on delete cascade,
  name text not null,
  color text,
  avatar text
);

create table categories (
  id text primary key,
  household_id uuid references households(id) on delete cascade,
  name text not null,
  icon text,
  color text,
  type text
);

create table transactions (
  id text primary key,
  household_id uuid references households(id) on delete cascade,
  type text not null,
  title text not null,
  amount numeric not null,
  category_id text,
  person_id text,
  date text,
  note text,
  created_at timestamptz default now()
);

create table recurring (
  id text primary key,
  household_id uuid references households(id) on delete cascade,
  type text, title text, amount numeric,
  category_id text, person_id text, interval text
);

create table savings (
  id text primary key,
  household_id uuid references households(id) on delete cascade,
  name text, target numeric, saved numeric default 0, icon text
);

alter table transactions enable row level security;
alter table savings enable row level security;
alter table recurring enable row level security;
alter table persons enable row level security;
alter table categories enable row level security;
alter table households enable row level security;

create policy "public access" on transactions for all using (true);
create policy "public access" on savings for all using (true);
create policy "public access" on recurring for all using (true);
create policy "public access" on persons for all using (true);
create policy "public access" on categories for all using (true);
create policy "public access" on households for all using (true);
```

#### 4.3 API-Schlüssel holen
1. Im Supabase Dashboard → **Settings** → **API**
2. Kopiere:
   - **Project URL** (z.B. `https://xyz.supabase.co`)
   - **anon public** Key

---

### 5. Umgebungsvariablen einrichten

Kopiere die Beispieldatei:

```bash
cp .env.example .env
```

Öffne `.env` und trage deine Supabase-Daten ein:

```env
EXPO_PUBLIC_SUPABASE_URL=https://DEIN_PROJEKT.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=dein_anon_key_hier
```

> ⚠️ Die `.env` Datei wird durch `.gitignore` geschützt und **nicht** auf GitHub hochgeladen.

---

### 6. App starten

#### Im selben WLAN:
```bash
npx expo start
```

#### Über das Internet (verschiedene Netzwerke):
```bash
npm run start:tunnel
```

QR-Code mit der iPhone-Kamera scannen → App öffnet sich in **Expo Go**.

---

## 👥 Zwei Personen einrichten

1. **Person 1** startet die App → gibt einen gemeinsamen Code ein (z.B. `FAMILIE2026`)
2. **Person 2** startet die App auf ihrem Gerät → gibt **denselben Code** ein
3. Beide sehen jetzt alle Daten in Echtzeit 🎉

---

## 📁 Projektstruktur

```
haushaltsbuch-app/
├── src/
│   ├── screens/
│   │   ├── DashboardScreen.js      # Monatsübersicht & Diagramme
│   │   ├── TransactionsScreen.js   # Buchungsliste mit Filter
│   │   ├── AddScreen.js            # Neue Buchung hinzufügen
│   │   ├── SavingsScreen.js        # Sparziele verwalten
│   │   ├── RecurringScreen.js      # Fixkosten & Abos
│   │   ├── SettingsScreen.js       # Einstellungen & Personen
│   │   └── HouseholdScreen.js      # Haushaltscode eingeben
│   ├── context/
│   │   └── AppContext.js           # Globaler State & Supabase-Sync
│   └── utils/
│       ├── supabase.js             # Supabase Client
│       ├── storage.js              # Standardwerte & AsyncStorage
│       └── theme.js                # Farben & Design-Konstanten
├── App.js                          # Einstiegspunkt & Navigation
├── app.json                        # Expo Konfiguration
├── eas.json                        # EAS Build Konfiguration
├── .env.example                    # Vorlage für Umgebungsvariablen
├── .gitignore
└── README.md
```

---

## 🔒 Sicherheit

- Supabase API-Schlüssel werden in `.env` gespeichert und nicht auf GitHub hochgeladen
- Row Level Security (RLS) ist für alle Tabellen aktiviert
- Haushaltscode wird nur lokal auf dem Gerät gespeichert

---

## 📱 App dauerhaft installieren

### Option A — Expo Go (einfach, kostenlos)
Expo Go App installieren und QR-Code scannen. PC muss laufen.

### Option B — EAS Build (permanent, 99€/Jahr)
Apple Developer Account erforderlich:
```bash
npx eas build --platform ios --profile preview
```

---

## 📄 Lizenz

Privates Projekt — nur zum persönlichen Gebrauch.

**Erstellt von Enno.W**
