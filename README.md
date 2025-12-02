# 🔮 Oracle WorkOS

**Plateforme collaborative immersive assistée par IA pour l'équipe Oracle Navigator.**

Oracle WorkOS est une "Single Page Application" (SPA) nouvelle génération conçue pour centraliser la gestion de projet, la communication et l'analyse de données. Elle combine une interface utilisateur futuriste (Glassmorphism), une intelligence artificielle générative (Google Gemini) et des outils de productivité en temps réel.

---

## 👥 L'Équipe & Gestion des Rôles (RBAC)

L'application intègre un système de gestion des droits (Role-Based Access Control) strict. Voici la composition de l'équipe et leurs privilèges dans le système.

### 1. Membres de l'équipe

| Avatar | Nom | Poste (Métier) | Rôle Système | Description |
| :--- | :--- | :--- | :--- | :--- |
| 🟥 | **Steve** | Team Lead | **ADMIN** | Super-utilisateur. A tous les pouvoirs sur la plateforme. |
| 🟦 | **Pascale** | Architecte | **MEMBRE** | Contributrice technique. Gère ses tâches et l'avancement. |
| 🟩 | **Nathalie** | Designer | **MEMBRE** | Contributrice créative. Gère les assets et le design. |
| 🟨 | **Ekra** | Dev Backend | **MEMBRE** | Contributeur technique. Gère l'API et la sécurité. |
| 🟧 | **Priscille**| Web Analyst | **VISITEUR** | Observatrice. Analyse les performances sans modifier le projet. |

### 2. Matrice des Permissions

Ce que chaque rôle a le droit de faire dans l'application :

| Action | 🛡️ ADMIN | 👤 MEMBRE | 👁️ VISITEUR |
| :--- | :---: | :---: | :---: |
| **Voir le projet** | ✅ | ✅ | ✅ |
| **Créer des tâches** | ✅ | ✅ | ❌ |
| **Modifier des tâches** | ✅ | ✅ | ❌ |
| **Déplacer (Drag & Drop)** | ✅ | ✅ | ❌ |
| **Supprimer des tâches** | ✅ | ❌ | ❌ |
| **Lancer l'IA (Gemini)** | ✅ | ✅ | ❌ |
| **Chat & Visio** | ✅ | ✅ | ✅ |

---

## 🚀 Fonctionnalités Actuelles (Ce que l'app fait)

L'application est actuellement en version **MVP (Minimum Viable Product)** avancé.

### 1. Gestion de Projet (Kanban)
*   **Tableau interactif :** Colonnes (À faire, En cours, En revue, Terminé).
*   **Drag & Drop :** Déplacement fluide des cartes de tâches.
*   **Détails & Édition :** Panneau latéral complet avec description, assignation, dates et historique des modifications.
*   **Secteurs :** Filtrage par pôle (Design, Dev, Marketing, Général).

### 2. Intelligence Artificielle (Oracle AI Analyst)
*   **Générateur de Rapports :** Analyse toutes les tâches du projet via **Google Gemini**.
*   **Visualisation :** Graphiques d'avancement, KPIs avec tendances, identification des risques.
*   **Historique :** Sauvegarde et consultation des anciens rapports générés.
*   **Mode Plein Écran :** Affichage immersif des données analytiques.

### 3. Calendrier & Agenda
*   **Vue Mensuelle :** Visualisation des deadlines et des réunions.
*   **Planification :** Création de réunions (Vidéo ou Présentiel) via glisser-déposer ou modale.
*   **Aperçu rapide :** Survol des dates pour voir le contenu du jour sans cliquer.

### 4. Communication & Collaboration
*   **Team Dashboard :** Vue personnelle filtrée ("Mes tâches", "Mes RDV").
*   **Meet Room :** Intégration de **Jitsi Meet** pour les visioconférences réelles + Interface 3D simulée.
*   **Chat d'équipe :** Messagerie instantanée avec persistance et synchronisation entre onglets.
*   **Notifications :** Système d'alertes visuelles lors d'actions importantes.

### 5. Technique & Persistance
*   **Sauvegarde Locale :** Toutes les données (tâches, chat, réunions) sont sauvegardées dans le `localStorage` du navigateur. Rien n'est perdu si vous rafraîchissez la page.
*   **Temps Réel Simulé :** Si vous ouvrez l'application dans deux onglets différents, les actions se synchronisent instantanément.

---

## 🚧 Limitations (Ce que l'app ne fait PAS encore)

Il est important de noter les limites actuelles pour les utilisateurs techniques :

1.  **Pas de Backend Distant :** Il n'y a pas de base de données (SQL/NoSQL) dans le cloud. Les données restent sur votre machine (navigateur). Si vous changez d'ordinateur, vous perdez vos données.
2.  **Sécurité Simulée :** L'authentification est déclarative. Il n'y a pas de mot de passe ni de token JWT réel. N'importe qui ayant accès à l'ordinateur peut sélectionner le profil "Admin".
3.  **Upload de Fichiers :** L'ajout de pièces jointes (PDF, Images) est visuel uniquement. Aucun fichier n'est réellement stocké sur un serveur.
4.  **Notifications Push :** L'application ne peut pas vous envoyer de notification si l'onglet est fermé.

---

## 🔮 Roadmap (Le Futur)

Voici les prochaines étapes de développement pour transformer ce prototype en produit commercialisable :

*   **V1.0 - Cloud :** Connexion à une base de données (Supabase ou Firebase) pour la collaboration à distance réelle.
*   **V1.1 - Sécurité :** Vraie authentification (Email/Mot de passe ou SSO Google).
*   **V1.2 - Mobile :** Adaptation Responsive complète pour smartphones (PWA).
*   **V2.0 - IA Vocale :** Contrôle de l'interface par la voix ("Oracle, crée une tâche pour Nathalie").

---

## 🛠️ Stack Technique

Pour les développeurs souhaitant maintenir le projet :

*   **Framework :** React 19 (Hooks, Context, Portals).
*   **Langage :** TypeScript (Typage strict des Interfaces `Task`, `User`, `Meeting`).
*   **Styles :** Tailwind CSS (Utilisation intensive de `backdrop-blur`, gradients et grid).
*   **IA :** Google GenAI SDK (`@google/genai`).
*   **Vizu :** Recharts (Graphiques de données).
*   **Icônes :** Lucide React.