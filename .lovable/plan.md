
# Stripe Subscription Integration Plan

## Uebersicht

Diese Integration fuegt Subscription-Payments mit Stripe zu Fintutto hinzu, inklusive Pricing-Seite, Checkout-Flow, Webhook-Handling und Feature-Gating.

---

## Phase 1: Voraussetzungen

### 1.1 Stripe aktivieren
- Lovable's Stripe-Integration aktivieren (erforderlich fuer Secret Key)
- Stripe Public Key als Environment Variable hinzufuegen

### 1.2 Datenbank-Setup
Neue Tabelle `user_subscriptions` in Supabase erstellen:

```text
+------------------------+
| user_subscriptions     |
+------------------------+
| id (UUID, PK)          |
| user_id (FK -> auth)   |
| stripe_customer_id     |
| stripe_subscription_id |
| app_id                 |
| plan_id                |
| status                 |
| current_period_start   |
| current_period_end     |
| cancel_at_period_end   |
| created_at             |
| updated_at             |
+------------------------+
```

RLS Policies:
- Users koennen nur eigene Subscriptions lesen
- Service Role kann alle Operationen ausfuehren (fuer Webhook)

---

## Phase 2: Backend (Edge Functions)

### 2.1 Edge Function: create-checkout-session
Erstellt Stripe Checkout Session fuer neue Subscriptions.

Eingabe: priceId, userId, userEmail, successUrl, cancelUrl
Ausgabe: Stripe Checkout URL

### 2.2 Edge Function: create-portal-session
Erstellt Stripe Customer Portal Session fuer bestehendes Abo-Management.

### 2.3 Edge Function: stripe-webhook
Verarbeitet Stripe Events:
- `checkout.session.completed` -> Subscription erstellen
- `customer.subscription.updated` -> Status aktualisieren
- `customer.subscription.deleted` -> Subscription beenden

---

## Phase 3: Frontend-Komponenten

### 3.1 Neue Dateien

```text
src/
├── pages/
│   ├── Pricing.tsx          # Pricing-Seite
│   └── Success.tsx          # Erfolgsseite nach Zahlung
├── components/
│   ├── pricing/
│   │   ├── PricingCard.tsx  # Einzelne Plan-Karte
│   │   └── BillingToggle.tsx # Monatlich/Jaehrlich Toggle
│   └── subscription/
│       └── UpgradePrompt.tsx # Upgrade-Hinweis fuer gesperrte Features
├── hooks/
│   └── useSubscription.ts   # Hook fuer Subscription-Status
├── lib/
│   └── stripe.ts            # Stripe-Hilfsfunktionen
└── types/
    └── subscription.ts      # TypeScript-Typen
```

### 3.2 Pricing-Seite Features
- Toggle zwischen monatlicher und jaehrlicher Abrechnung
- 3 Plan-Karten: Free, Pro, Business
- Dynamische Button-Logik basierend auf Auth-Status und aktuellem Plan
- Responsive Design (Cards nebeneinander auf Desktop, gestapelt auf Mobile)

### 3.3 Success-Seite
- Konfetti-Animation
- Erfolgsmeldung
- Button zur App-Rueckkehr

---

## Phase 4: Feature-Gating

### 4.1 useSubscription Hook
```text
Gibt zurueck:
- subscription: Aktuelle Subscription-Daten
- plan: 'free' | 'pro' | 'business'
- isPro: boolean
- isBusiness: boolean
- isActive: boolean
- loading: boolean
```

### 4.2 UpgradePrompt Komponente
Zeigt Upgrade-Hinweis wenn User auf gesperrte Features zugreift:
- Lock-Icon
- Feature-Beschreibung
- Button zur Pricing-Seite

---

## Phase 5: Integration

### 5.1 Routing (App.tsx)
Neue Routes hinzufuegen:
- `/pricing` -> Pricing.tsx
- `/success` -> Success.tsx

### 5.2 Header Navigation
- "Preise" Link hinzufuegen
- Account-Dropdown mit "Abo verwalten" Option

### 5.3 Beispiel Feature-Gating
In der Berechnungen-Seite: Unbegrenzte Berechnungen nur fuer Pro/Business

---

## Technische Details

### Pricing-Struktur (konfigurierbar)

| Plan     | Monat | Jahr (20% Rabatt) | Features                        |
|----------|-------|-------------------|----------------------------------|
| Free     | 0 EUR   | 0 EUR               | 3 Berechnungen, Basic Features |
| Pro      | 9,99 EUR| 95,90 EUR           | Unbegrenzt, Export, Charts     |
| Business | 29,99 EUR| 287,90 EUR          | Alles + Team-Features          |

### Edge Function CORS-Headers
Alle Edge Functions benoetigen CORS-Headers fuer Web-Zugriff.

### Webhook-Sicherheit
- Signature-Verification mit STRIPE_WEBHOOK_SECRET
- Idempotente Updates

---

## Reihenfolge der Implementierung

1. Stripe aktivieren und Secrets konfigurieren
2. Datenbank-Migration erstellen
3. TypeScript-Typen definieren
4. Edge Functions erstellen (checkout, portal, webhook)
5. useSubscription Hook implementieren
6. Pricing-Seite erstellen
7. Success-Seite erstellen
8. UpgradePrompt Komponente erstellen
9. Routing und Navigation aktualisieren
10. Feature-Gating in bestehende Komponenten integrieren
11. End-to-End Testing

---

## Notwendige Secrets (Supabase)

| Name                    | Beschreibung                    |
|-------------------------|---------------------------------|
| STRIPE_SECRET_KEY       | Stripe API Secret Key           |
| STRIPE_WEBHOOK_SECRET   | Webhook Signing Secret          |

## Environment Variable (Frontend)

| Name                      | Beschreibung            |
|---------------------------|-------------------------|
| VITE_STRIPE_PUBLIC_KEY    | Stripe Publishable Key  |

