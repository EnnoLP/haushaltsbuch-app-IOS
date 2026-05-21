# 🎉 Release v1.0.0 — Erster Release

**Datum:** 21. Mai 2026
**Erstellt von:** Enno.W
**Plattform:** iOS / iPadOS (iPhone & iPad)

---

## 🆕 Was ist neu

Dies ist der erste offizielle Release der **Haushaltsbuch App** — eine private App zur gemeinsamen Finanzverwaltung für zwei Personen.

---

## ✨ Funktionen in dieser Version

### 💸 Einnahmen & Ausgaben
- Buchungen mit Titel, Betrag, Datum und Notiz erfassen
- Jeder Buchung eine Kategorie und Person zuweisen
- Buchungen löschen und durchsuchen
- Filterung nach Einnahmen / Ausgaben

### 📊 Dashboard
- Monatsübersicht mit Gesamtkontostand
- Einnahmen und Ausgaben auf einen Blick
- Ausgaben-Tortendiagramm nach Kategorien
- Persönliche Übersicht für Person 1 & Person 2
- Navigation zwischen Monaten

### 🔄 Wiederkehrende Buchungen
- Fixkosten einmalig anlegen (Miete, Abos, etc.)
- Intervalle: Monatlich, Wöchentlich, Jährlich
- Gesamtübersicht der monatlichen Fixkosten

### 🎯 Sparziele
- Sparziele mit Name, Betrag und Icon anlegen
- Einzahlungen tracken
- Fortschrittsbalken mit Prozentanzeige
- Abgeschlossene Ziele werden markiert

### 🏷️ Kategorien
- 10 Standard-Kategorien vorinstalliert
- Eigene Kategorien mit Icon und Farbe erstellen

### 👥 2-Personen-Modus
- Gemeinsamer Haushaltscode für beide Personen
- Echtzeit-Synchronisation über Supabase
- Jede Buchung wird einer Person zugeordnet
- Funktioniert auf verschiedenen Geräten und Netzwerken

### ⚙️ Einstellungen
- Personen umbenennen
- Avatar und Farbe pro Person anpassen
- Haushaltscode anzeigen & teilen
- Haushalt verlassen (Daten bleiben erhalten)

---

## 🛠 Tech Stack

| Technologie | Version |
|------------|---------|
| Expo | SDK 54 |
| React Native | 0.76.5 |
| Supabase | 2.45.4 |
| React Navigation | 6.x |

---

## 📱 Installation

Siehe [README.md](./README.md) für die vollständige Installationsanleitung.

**Kurzanleitung:**
1. `npm install`
2. `.env` Datei mit Supabase-Zugangsdaten anlegen
3. `npx expo start --tunnel` starten
4. QR-Code mit Expo Go auf dem iPhone scannen

---

## ⚠️ Bekannte Einschränkungen

- Die App benötigt eine aktive Internetverbindung für die Synchronisation
- Ohne laufenden PC ist die App nur über Expo Go erreichbar
- Ein Apple Developer Account (99€/Jahr) ist für eine dauerhafte Installation ohne Expo Go erforderlich

---

## 🔒 Datenschutz

- Alle Daten werden in einer privaten Supabase-Datenbank gespeichert
- Kein öffentlicher Zugriff auf die Daten
- API-Schlüssel werden lokal in `.env` gespeichert und nicht auf GitHub hochgeladen

---

> **Nur zum privaten Gebrauch — Erstellt von Enno.W**
