📑 Rapport Technique : Mécanisme d'Évaluation Stratégique IA
1. La Source de "l'Intelligence" (Le Modèle Pré-entraîné)
Gemini (le modèle d'IA utilisé) a "lu" des millions de tickets Jira, de spécifications techniques, de documentation (GitHub, StackOverflow) et de livres sur la gestion de projet.
Il possède une "culture générale" du développement informatique.
Il sait que "Mettre en place une authentification JWT" est une tâche complexe (Effort élevé) et critique (Impact fort).
Il sait que "Changer la couleur du bouton" est une tâche simple (Effort faible) et souvent cosmétique (Impact modéré).
2. Les Données d'Entrée (Ce que l'IA lit)
L'IA ne connaît pas votre équipe personnellement. Pour juger une tâche, elle se base uniquement sur deux champs que vous avez remplis :
Le Titre (ex: "Intégration Carte 3D")
La Description (ex: "Optimisation Three.js pour mobile...")
Note : Plus la description est précise, plus le score sera juste. Si vous écrivez juste "Faire le truc", l'IA mettra un score moyen par défaut.
3. La "Directive Cachée" (Le Prompt Système)
Même si vous n'avez pas donné de directives, j'en ai codé une dans le fichier geminiService.ts. C'est ce qu'on appelle le "Prompt Engineering".
À chaque fois que vous analysez une tâche, l'application envoie secrètement cette instruction stricte à Gemini :
*"Tu es un expert en gestion de projet. Analyse cette tâche pour une application mobile d'entreprise.
Estime :
Impact Business (0-100) : À quel point cela apporte de la valeur ?
Effort (1-10) : Complexité estimée.
Thème : Choisis parmi [Acquisition, Revenus, Tech Debt, UX, Sécurité...]."*
4. Le Processus de Déduction (Exemples concrets)
Voici comment l'IA raisonne pour attribuer les scores sur vos tâches actuelles :
Cas A : "Auth System MVVM"
Mots-clés détectés : "Sécurité", "Token", "Connexion".
Raisonnement IA : "Sans connexion, l'app ne marche pas. C'est critique pour le business. C'est de l'architecture backend, c'est complexe."
Résultat : Impact 95/100 (Critique) | Effort 5/10 (Moyen).
Cas B : "Maquette iOS 18 Home"
Mots-clés détectés : "Design", "Icônes", "Flou", "Apple Guidelines".
Raisonnement IA : "C'est visuel. Ça améliore l'expérience utilisateur (UX) mais ça ne bloque pas le fonctionnement de l'app. C'est du travail de précision."
Résultat : Impact 85/100 (Important pour la qualité) | Effort 3/10 (Faible complexité technique).
Cas C : "Intégration Carte 3D"
Mots-clés détectés : "Three.js", "Optimisation", "Shaders".
Raisonnement IA : "La 3D sur mobile est techniquement très difficile (performance). Si ça rame, les utilisateurs partent."
Résultat : Impact 60/100 (Fonctionnalité cool mais peut-être pas vitale) | Effort 8/10 (Très difficile).
5. Résumé
L'IA utilise sa connaissance du vocabulaire technique pour :
Catégoriser le sujet (Est-ce du Design ? Du Backend ? Du Marketing ?).
Comparer ce sujet à des standards de l'industrie pour noter la difficulté.
Évaluer l'importance business implicite (La sécurité > Le changement de couleur).
C'est donc une estimation statistique basée sur le vocabulaire utilisé dans vos tâches.