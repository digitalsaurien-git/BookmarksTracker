# PRD (Google Antigravity) — BookmarksTracker

## 1) Mission (1 phrase)
Créer une application de gestion intelligente de bookmarks pour un usage personnel et professionnel, afin d’organiser, rechercher, taguer, et accéder à ses liens internet facilement, depuis n’importe où.

## 2) Ce que je dois voir (resultat concret a l'ecran)
- Un écran d’accueil avec deux sections principales : "Perso" et "Pro".
- Chaque section affiche des dossiers et sous-dossiers (arborescence cliquable).
- À l’intérieur d’un dossier, liste visuelle des bookmarks (titre, favicon du site, URL cliquable).
- Barre de recherche en haut (recherche dans tous les liens, tags inclus).
- Champs de saisie pour ajouter un bookmark (titre, URL, dossier, tags).
- Option de déplacement rapide d’un lien vers un autre dossier (drag & drop ou menu contextuel).
- Bouton d’export et d’import des bookmarks.
- Liste de tags affichées sous ou à côté de chaque lien.

**Comportements/interactions :**
- Cliquer sur un lien ouvre le site dans un nouvel onglet.
- Cliquer-glisser un lien ou utiliser un menu pour le déplacer entre dossiers.
- Filtrer instantanément les bookmarks grâce à la recherche ou en cliquant sur un tag.

## 3) Perimetre (IN / OUT)
**IN** (livré maintenant) :
- Création de dossiers/sous-dossiers (arborescence simple)
- Ajout/suppression/édition de bookmarks
- Tags sur chaque bookmark
- Recherche en texte libre sur liens et tags
- Déplacement de liens entre dossiers
- Export/import de l’ensemble des bookmarks (fichier texte ou JSON)
- Interface séparée Perso/Pro
- Protection par mot de passe maître (Login/Initialisation)


**OUT** (à exclure ou pour plus tard) :
- Partage de bookmarks avec d’autres personnes
- Synchronisation multi-utilisateur/cloud avec authentification (Désormais IN avec Supabase)
- Gestion avancée de droits d’accès
- Aperçu du site web (miniature)
- Rappels, notifications ou intégrations externes automatiques

## 4) Utilisateurs & contexte
- Un utilisateur unique, usage privé et professionnel.
- Utilisation aussi bien au bureau (environnement avec proxy) qu’à la maison.
- Accès sur ordinateur (navigateur web) ; conception pour la simplicité et la rapidité.
- Fréquence : après chaque découverte de lien utile, gestion et recherche quasi-quotidienne.
- Objectif : ne jamais perdre un lien et retrouver rapidement n’importe quelle ressource numérique.

## 5) Donnees / contenu
- Bookmarks : titre, URL (format texte, obligatoire), dossier/sous-dossier (arborescence), tags (simples, séparés par virgules).
- Dossiers : noms personnalisables, hiérarchie Perso/Pro.
- Fichiers d’export/import : format recommandés JSON et CSV.
- Toutes les données sont stockées localement (dans le navigateur, type `localStorage` ou fichier export).

## 6) Regles de qualite (non-negociables)
**DO :**
- Interface toujours claire et visuelle, aucune surcharge d’options.
- Ajout et recherche d’un bookmark en moins de 10 secondes.
- Séparation stricte entre "Perso" et "Pro" partout dans l’UI.
- Action de déplacement et édition facile (moins de 2 clics).
- Export/import doit pouvoir se faire en 1 clic.

**DON'T :**
- Ne jamais mélanger perso et pro.
- Interdiction de dépendre trop fortement d'une connexion lente (Mode Offline / Cache requis).
- Pas de surcharge visuelle ni publicité.
- Ne jamais perdre un lien sans confirmation.

## 7) Decisions techniques
- Stack : Application web en HTML/CSS/JS vanilla ou React minimaliste (pour flexibilité visuelle responsive).
- Stockage : `localStorage` pour compatibilité totale avec proxy/restrictions entreprise.
- Layout : Sidebar à gauche pour l’arborescence, panneau principal pour listes et détails.
- Navigation : SPA (single page, tout accessible sans recharger).
- Backend Cloud : Intégration Supabase pour la synchronisation en temps réel.

## 8) Plan de mission (etapes en langage humain)
1. **Accueil Perso/Pro** : L’utilisateur accède à deux sections séparées dès la page d’accueil (preuve : capture d’écran affichant "Perso" et "Pro").
2. **Création & gestion des dossiers** : Peut créer, renommer ou supprimer des dossiers et sous-dossiers (preuve : dossier créé et visible instantanément).
3. **Ajout et affichage de bookmarks** : Peut ajouter un bookmark (champ + bouton) et il apparaît dans le dossier choisi (preuve : le lien apparaît, clickable).
4. **Tag & recherche** : Peut assigner un tag lors de l’ajout, puis retrouve le lien via un champ de recherche (preuve : lien retrouvé après recherche/tap sur tag).
5. **Déplacement** : Peut déplacer un lien d’un dossier à un autre sans recharger la page (preuve : lien visible dans le nouveau dossier).
6. **Export/import** : Peut sauvegarder tous ses bookmarks en un clic (fichier téléchargé) et réimporter ce fichier pour retrouver la structure (preuve : bookmarks restaurés après import).
7. **Test sur différents environnements** : Vérifier fonctionnement en local sans internet, y compris derrière proxy d’entreprise (preuve : même fichier utilisé, même interface affichée).

## 9) Preuves attendues (pour valider sans technique)
- Capture d’écran montrant les deux sections Perso/Pro.
- Vidéo ou gif court montrant l’ajout, la recherche, et le déplacement d’un bookmark.
- Fichier d’export lisible avec ses tags, dossiers, URLs.
- Walkthrough étape par étape (pdf/texte) : créer dossier, ajouter un lien, le retrouver, l’exporter.

## 10) Checklist de validation (pass/fail)
- [ ] Je vois directement les sections Perso et Pro à l’accueil.
- [ ] Je peux créer un dossier et il s’ajoute instantanément.
- [ ] Je peux ajouter un lien avec Titre + URL + Tag + Dossier.
- [ ] Cliquer on un bookmark ouvre bien le site correspondant.
- [ ] Rechercher un mot-clef affiche bien tous les liens/tag correspondants.
- [ ] Je peux déplacer un lien d’un dossier à un autre, il disparaît de l’ancien.
- [ ] Je peux taguer un lien, puis filtres par ce tag l’affichent bien.
- [ ] Un bouton “Exporter” sauvegarde tous mes liens dans un fichier.
- [ ] Un bouton “Importer” restaure bien toute ma structure de bookmarks.
- [ ] L’interface reste claire et rapide, sans menu caché inutile.
- [ ] Je ne perds jamais de lien sans validation/confirmation.
- [ ] Tout fonctionne sans connexion internet ou login.

---


## 12) Évolutions Premium (v2.0)
- **UI "Sober Premium"** : Interface épurée avec mesh gradients, flous de profondeur (glassmorphism) et typographie Outfit haute lisibilité.
- **Importation Universelle** : Parseur HTML Netscape supportant les exports de tous les navigateurs majeurs (Chrome, Firefox, Safari, SiteBar).
- **Synchronisation Cloud (Supabase)** : Persistance sécurisée des dossiers et favoris avec accès multi-appareils.
- **Performance Optimisée** : Migration vers Tailwind 4 et Vite 8 pour des temps de chargement ultra-rapides.
- **Expérience Bureau Class A** : Sidebar large et confortable, barre de recherche centrale inspirée des meilleurs outils de productivité (Command+K).


