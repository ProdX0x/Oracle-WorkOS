# 💡 Backlog des Nouvelles Fonctionnalités (V2)

Ce document sert de **"Laboratoire d'Idées"** pour l'évolution future d'Oracle WorkOS. Il recense les fonctionnalités proposées, analysées et validées pour les prochaines versions majeures, afin de ne rien oublier.

---

## 🌟 Fonctionnalité Star : "Oracle Smart Command" (Text-to-Action)

**Concept :**
Transformer l'application en assistant actif capable de comprendre des instructions en langage naturel pour effectuer des actions de gestion.

**Description :**
L'administrateur dispose d'une barre de commande (type `Ctrl+K` ou input dédié "Magic Task") où il peut taper une instruction complète. L'IA analyse la phrase et pré-remplit les formulaires.

**Exemple de prompt utilisateur :**
> *"Assigne à Nathalie la création des maquettes iOS pour vendredi prochain à 14h."*

**Comportement attendu :**
1.  L'IA détecte l'intention : `CREATE_TASK`.
2.  Elle identifie les entités :
    *   Utilisateur : Nathalie (u3)
    *   Titre : Création des maquettes iOS
    *   Secteur : Design (déduit)
    *   Deadline : Date du vendredi suivant + Heure.
3.  **Action :** Elle ouvre la modale de création de tâche **pré-remplie**.

**⚠️ Règle d'Or (Coexistence) :**
*   Cette fonctionnalité est un **accélérateur** (raccourci).
*   Elle **ne remplace PAS** la création manuelle. Le bouton `+ Nouvelle Tâche` classique reste accessible et prioritaire pour les utilisateurs qui préfèrent le contrôle total ou le clic.
*   L'IA ne doit jamais créer l'entrée en base de données sans une validation humaine (clic sur "Confirmer") pour éviter les erreurs d'interprétation.

---

## 🔮 Autres Pistes pour la V2

### 1. Mode "Offline First" (PWA Avancée)
*   **Idée :** Permettre de consulter les tâches et d'en créer de nouvelles même sans connexion internet (avion, train).
*   **Technique :** Synchronisation différée. L'app enregistre l'action et l'envoie au serveur dès que la connexion revient.

### 2. Notifications Intelligentes
*   **Idée :** Au lieu de spammer l'utilisateur à chaque mouvement, l'IA génère un "Daily Digest" (Résumé quotidien) le matin.
*   **Exemple :** *"Bonjour Steve, pendant votre absence, Nathalie a terminé 2 tâches et Pascale a ajouté un commentaire urgent."*

### 3. Gestion Documentaire (GED)
*   **Idée :** Rendre l'onglet "Fichiers" réel.
*   **Fonction :** Glisser-déposer de vrais fichiers PDF/Images qui sont stockés sur le cloud (Storage), avec prévisualisation directement dans l'application.

### 4. Commande Vocale (Voice-to-Task)
*   **Idée :** Extension de la "Smart Command".
*   **Fonction :** Utiliser le micro (déjà présent pour la visio) pour dicter les tâches en marchant. L'IA transcrit et exécute.

### 5. Analyse de Sentiment d'Équipe
*   **Idée :** L'IA analyse le ton des messages dans le Chat.
*   **Utilité :** Détecter les tensions ou la baisse de moral avant qu'elles ne deviennent critiques (Indicateur "Météo de l'équipe").

---

## 🛠️ Notes Techniques pour l'implémentation V2

*   Ces fonctionnalités nécessitent impérativement le passage à un **Backend Cloud** (Firebase/Supabase).
*   L'utilisation de l'IA pour les commandes nécessite une gestion fine des **Tokens** (coût API) et de la latence (l'interface doit rester réactive).
