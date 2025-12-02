# 🗺️ Roadmap & État Technique - Oracle WorkOS

> **Dernière mise à jour :** Décembre 2023
> **Version :** MVP (Local Storage)

Ce document détaille l'état technique actuel du projet, la checklist des fonctionnalités implémentées et la feuille de route pour les développeurs.

---

## 📂 État Actuel du Code

Le dépôt contient l'ensemble du code source front-end nécessaire au fonctionnement de l'application. L'architecture est modulaire et typée strictement.

### Structure du projet
*   **Core :** `App.tsx` (Gestionnaire d'état global, Routing, Sync Multi-onglets).
*   **UI Components :**
    *   `ProjectBoard.tsx` : Tableau Kanban avec Drag & Drop et CRUD.
    *   `AIPulse.tsx` : Interface d'analyse IA avec graphiques Recharts.
    *   `VirtualRoom.tsx` : Salle de visio (Jitsi Meet) et interface 3D.
    *   `CalendarView.tsx` : Planification et Agenda interactif.
    *   `TeamDashboard.tsx` : Vue synthétique par utilisateur.
*   **Services :** `geminiService.ts` (Intégration API Google GenAI).
*   **Data Models :** `types.ts` (Interfaces TypeScript strictes) et `constants.ts` (Mock data).
*   **Styling :** Tailwind CSS via CDN avec configuration personnalisée pour les effets de verre.

---

## ✅ Checklist des Fonctionnalités

Voici l'état d'avancement des modules par rapport à la vision finale du produit :

| Module / Fonctionnalité | Statut | Priorité | Description Technique |
| :--- | :---: | :---: | :--- |
| **Interface Glassmorphism** | ✅ Implémenté | - | UI complète, responsive et animée via Tailwind. |
| **Kanban (CRUD + D&D)** | ✅ Implémenté | Haute | Création, édition, suppression et déplacement de tâches. Persistance locale. |
| **RBAC (Gestion Rôles)** | ✅ Implémenté | Haute | Logique front-end pour Admin/Membre/Visiteur. Masquage conditionnel des boutons. |
| **Agenda & Planification** | ✅ Implémenté | Moyenne | Vue calendrier, Drag & Drop des événements, création de réunions. |
| **Chat d'équipe** | ✅ Implémenté | Moyenne | Messagerie instantanée avec contexte par secteur. |
| **Sync Temps Réel (Local)** | ✅ Implémenté | Haute | Synchronisation multi-onglets via `StorageEvent` (simulation de sockets). |
| **Intégration Jitsi Meet** | ✅ Implémenté | Moyenne | Iframe Jitsi embarquée pour la visioconférence réelle. |
| **IA Gemini (Rapports)** | ✅ Implémenté | Haute | Génération de JSON structuré, analyse de risques et KPIs via Google GenAI SDK. |
| **Authentification Réelle** | ❌ À faire | Critique | Actuellement simulée (sélecteur de profil). Nécessite un Provider (Auth0/Firebase). |
| **Backend / Database** | ❌ À faire | Critique | Actuellement `localStorage`. Nécessite une migration vers une DB Cloud. |
| **Upload de Fichiers** | ⚠️ Partiel | Basse | Interface UI présente, mais pas de stockage S3/Blob réel. |

---

## 📅 Roadmap Détaillée

### Phase 1 : Infrastructure & Backend (Priorité Absolue)
Actuellement, l'application est "Client-Side Only". La priorité est de persister les données dans le cloud.
*   **Stack recommandée :** Supabase (PostgreSQL + Realtime) ou Firebase.
*   **Action :** Migrer les appels `localStorage` dans `App.tsx` vers des hooks de données asynchrones (ex: `useQuery`).

### Phase 2 : Sécurité & Auth
*   **Authentification :** Remplacer le sélecteur d'utilisateur par une vraie page de Login (JWT).
*   **Sécurité des Données :** Implémenter RLS (Row Level Security) côté base de données pour que les règles de rôles (Admin/Visiteur) soient infranchissables.

### Phase 3 : Optimisation & Scalabilité
*   **Caching IA :** Stocker les résultats des rapports Gemini en base de données pour économiser les appels API.
*   **Contextes IA :** Envoyer l'historique du chat et les fichiers PDF uploadés à Gemini pour des analyses plus contextuelles.
*   **Mobile :** Adapter les vues `ProjectBoard` et `CalendarView` pour une utilisation tactile sur mobile (PWA).

---

## 👨‍💻 Conseils pour les Développeurs

### 1. Maintenir la structure existante
*   **Typage Strict :** Ne jamais utiliser `any`. Les interfaces dans `types.ts` (`Task`, `User`, `Meeting`) sont la source de vérité. Mettez-les à jour avant de toucher aux composants.
*   **Composants "Purs" :** Les composants UI (`ProjectBoard`, `CalendarView`) reçoivent les données via les `props`. Ne faites pas d'appels API directs dans ces composants, passez par le parent `App.tsx` ou des Custom Hooks.

### 2. Gestion de l'IA
*   Le service Gemini (`geminiService.ts`) utilise une clé API via `process.env`. Assurez-vous de ne jamais commiter de clé API réelle dans le dépôt GitHub.
*   Le prompt système est conçu pour retourner du JSON pur. Si vous modifiez le prompt, testez rigoureusement le parsing JSON car les LLM peuvent parfois être verbeux.

### 3. Styles & Performance
*   L'application utilise beaucoup de `backdrop-filter: blur()`. C'est coûteux en performances GPU. Testez régulièrement sur des machines moins puissantes.
*   Utilisez `React.memo` si les listes de tâches deviennent très longues pour éviter les re-renders inutiles lors du Drag & Drop.

---
*Fichier généré pour le suivi technique du projet Oracle-WorkOS.*