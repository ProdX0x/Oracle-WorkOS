# 🔮 Oracle WorkOS

> **Plateforme de gestion de projet immersive assistée par IA.**

**Oracle WorkOS** est une Single Page Application (SPA) développée en **React 19** et **TypeScript**. Elle vise à redéfinir l'expérience de collaboration d'équipe en fusionnant une interface utilisateur futuriste ("Glassmorphism"), des outils de productivité classiques (Kanban, Calendrier) et une couche d'intelligence artificielle générative (Google Gemini) pour l'analyse de projet en temps réel.

Ce projet est actuellement un **MVP (Minimum Viable Product)** fonctionnel fonctionnant en local, conçu pour démontrer les capacités d'une interface de travail unifiée.

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

## 🗺️ Roadmap & Recommandations Techniques

Pour passer du stade de MVP Local à une application de production, l'équipe de développement doit suivre cette feuille de route technique :

### Phase 1 : Infrastructure & Backend (Priorité Absolue)
Actuellement, l'application est "Client-Side Only". La priorité est de persister les données dans le cloud.
*   **Stack recommandée :** Supabase (PostgreSQL + Realtime) ou Firebase.
*   **Migration :** Remplacer les appels `localStorage` dans `App.tsx` par des hooks de données (ex: `useQuery`, `useEffect` avec subscription).

### Phase 2 : Sécurité & Auth
*   **Implémentation :** Remplacer le sélecteur d'utilisateur par une vraie authentification (JWT).
*   **RBAC Backend :** Sécuriser les API (Row Level Security) pour que les règles de rôles (Admin/Visiteur) soient appliquées côté serveur et non plus seulement côté client.

### Phase 3 : Optimisation IA
*   **Caching :** Stocker les rapports IA en base pour éviter de rappeler l'API Gemini à chaque rechargement (coûts API).
*   **Contexte étendu :** Envoyer l'historique du chat à Gemini pour des analyses contextuelles plus fines.

---

## 👨‍💻 Conseils pour les Développeurs

### 1. Maintenir la structure existante
*   **Typage Strict :** Ne jamais utiliser `any`. Les interfaces dans `types.ts` (`Task`, `User`, `Meeting`) sont la source de vérité. Mettez-les à jour avant de toucher aux composants.
*   **Composants "Purs" :** Les composants UI (`ProjectBoard`, `CalendarView`) reçoivent les données et les fonctions de modification via les `props`. Ne faites pas d'appels API directs dans ces composants, passez par le parent `App.tsx` ou des Custom Hooks.

### 2. Gestion de l'IA
*   Le service Gemini (`geminiService.ts`) utilise une clé API via `process.env`. Assurez-vous de ne jamais commiter de clé API réelle dans le dépôt.
*   Le prompt système est conçu pour retourner du JSON pur. Si vous modifiez le prompt, testez rigoureusement le parsing JSON car les LLM peuvent parfois être verbeux.

### 3. Styles & Performance
*   L'application utilise beaucoup de `backdrop-filter: blur()`. C'est coûteux en performances GPU. Testez régulièrement sur des machines moins puissantes.
*   Utilisez `React.memo` si les listes de tâches deviennent très longues pour éviter les re-renders inutiles lors du Drag & Drop.

---

## 📝 Notes Importantes

*   **API Key :** Pour faire fonctionner l'analyse IA, une variable d'environnement `API_KEY` (Google Gemini) est requise.
*   **Portals :** Les modales (Création de tâche, Rapport IA) utilisent `createPortal` pour s'afficher au-dessus de l'UI complexe. Vérifiez le fichier `index.html` pour vous assurer que la structure du DOM est compatible (montage sur `document.body`).
*   **Navigateur :** L'API `StorageEvent` utilisée pour la synchronisation locale fonctionne entre les onglets d'un même navigateur, mais pas entre différents navigateurs ou machines.

---
*Généré automatiquement pour la documentation du projet Oracle-WorkOS.*