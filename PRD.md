# PRD (Google Antigravity) — BookmarksTracker

## 1) Mission (1 phrase)
Créer une application de gestion intelligente de bookmarks pour un usage personnel et professionnel, afin d’organiser, rechercher, taguer, et accéder à ses liens internet facilement, depuis n’importe où.

## 2) Ce que je dois voir (resultat concret a l'ecran)
- Un écran d’accueil avec un bouton alternatif "Perso" / "Boulot" pour séparer les espaces.
- Dans chaque espace, une arborescence de dossiers et sous-dossiers cliquables.
- À l’intérieur d’un dossier, liste visuelle des bookmarks (titre, favicon du site, URL cliquable).
- Barre de recherche en haut (recherche dans tous les liens de l'espace actif).
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
- Déplacement de liens entre dossiers (Drag & Drop)
- Déplacement de dossiers (Drag & Drop) pour restructurer la hiérarchie
- Export/import de l’ensemble des bookmarks (fichier texte ou JSON)
- Séparation espace Perso et Boulot via toggle (mais sans dossiers racines "clutter")
- Protection par mot de passe maître (Login/Initialisation)


**OUT** (à exclure ou pour plus tard) :
- Partage de bookmarks avec d’autres personnes
- Synchronisation multi-utilisateur/cloud avec authentification (Désormais IN avec Supabase)
- Gestion avancée de droits d’accès
- Aperçu du site web (miniature)
- Rappels, notifications ou intégrations externes automatiques

## 4) Utilisateurs & contexte
- Un utilisateur unique, usage privé et professionnel mélangé ou organisé par dossiers.
- Utilisation aussi bien au bureau (environnement avec proxy) qu’à la maison.
- Accès sur ordinateur (navigateur web) ; conception pour la simplicité et la rapidité.
- Fréquence : après chaque découverte de lien utile, gestion et recherche quasi-quotidienne.
- Objectif : ne jamais perdre un lien et retrouver rapidement n’importe quelle ressource numérique.

## 5) Données / contenu (Nouveau Data Model)
- **Bookmarks** :
    - `id` : Identifiant unique (UUID/Timestamp).
    - `title` : Titre explicite du lien.
    - `url` : URL complète (cliquable).
    - `description` : Notes de contexte (Pourquoi ce lien ? Que contient-il ?).
    - `folderId` : Parenté (Arborescence limitée à 2 niveaux).
    - `tags` : Liste structurée au format `clé:valeur` (ex: `tool:make`).
    - `isFavorite` : Booléen pour l'accès rapide.
    - `clicks` : Compteur pour la popularité.
    - `createdAt` : Date de création.
    - `type` : Contexte (`perso` ou `pro`).
- **Dossiers** :
    - `id`, `name`, `parentId`, `type` (perso/pro), `color`.
- **Système de Tags Structurés** :
    - `tool:nom` (ex: `tool:figma`)
    - `type:format` (ex: `type:article`)
    - `projet:nom` (ex: `projet:site-web`)
    - `status:etat` (ex: `status:a-lire`)
    - `prio:niveau` (ex: `prio:1`)
    - `usage:frequence` (ex: `usage:quotidien`)

- **Stockage** : Toutes les données sont stockées localement (`localStorage`) et synchronisées via Supabase dans un payload unique pour la rapidité.

## 6) Regles de qualite (non-negociables)
**DO :**
- Interface toujours claire et visuelle, aucune surcharge d’options.
- Ajout et recherche d’un bookmark en moins de 10 secondes.
- Structure simple et intuitive.
- Action de déplacement et édition facile (moins de 2 clics).
- Export/import doit pouvoir se faire en 1 clic.

**DON'T :**
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
1. **Toggle Perso/Boulot** : L’utilisateur bascule entre ses deux espaces de travail via un bouton dédié.
2. **Arborescence Propre** : Les dossiers racines redondants "Favoris Perso/Pro" sont supprimés ; le contenu remonte directement au premier niveau.
3. **Ajout et affichage de bookmarks** : Peut ajouter un bookmark (champ + bouton) et il apparaît dans le dossier choisi.
4. **Tag & recherche** : Peut assigner un tag lors de l’ajout, puis retrouve le lien via un champ de recherche.
5. **Déplacement & Restructuration** : Peut déplacer un lien ou un dossier entier par glisser-déposer (Drag & Drop) vers un nouveau dossier ou vers la racine.
6. **Export/import** : Peut sauvegarder tous ses bookmarks en un clic (fichier téléchargé) et réimporter ce fichier pour retrouver la structure.
7. **Migration** : Les anciens dossiers "Perso" et "Pro" sont aplatis lors de la première utilisation.

## 9) Preuves attendues (pour valider sans technique)
- Capture d’écran montrant l'arborescence unifiée.
- Vidéo ou gif court montrant l’ajout, la recherche, et le déplacement d’un bookmark.
- Fichier d’export lisible avec ses tags, dossiers, URLs.

## 10) Checklist de validation (pass/fail)
- [ ] Je peux basculer instantanément entre l'espace Perso et Boulot.
- [ ] L'arborescence est "propre" (pas de dossier racine redondant au sommet).
- [ ] Je peux créer un dossier et il s’ajoute instantanément dans l'espace actif.
- [ ] Cliquer on un bookmark ouvre bien le site correspondant.
- [ ] Rechercher un mot-clef affiche bien tous les liens/tag correspondants.
- [ ] Je peux déplacer un lien d’un dossier à un autre.
- [ ] Je peux taguer un lien, puis filtres par ce tag l’affichent bien.
- [ ] Un bouton “Exporter” sauvegarde tous mes liens dans un fichier.
- [ ] Un bouton “Importer” restaure bien toute ma structure de bookmarks.
- [ ] Tout fonctionne sans connexion internet (cache local).

---

## 12) Évolutions Premium (v2.0)
- **UI "Sober Premium"** : Interface épurée avec mesh gradients, flous de profondeur (glassmorphism) et typographie Outfit haute lisibilité.
- **Importation Universelle** : Parseur Netscape supportant Chrome, Firefox, Safari.
- **Synchronisation Cloud (Supabase)** : Persistance sécurisée multi-appareils.
- **Expérience Bureau Class A** : Sidebar large (420px), barre de recherche centrale.
- **Filtrage Intelligent (Vues)** :
    - ⭐ **Favoris** : Liens marqués `isFavorite`.
    - ⏱️ **Daily** : Filtre sur `usage:quotidien`.
    - 📁 **Projets Actifs** : Regroupe les tags `projet:*` avec un `status:en-cours`.
    - 🔭 **À Explorer** : Liens jamais cliqués ou tagués `status:a-explorer`.
    - 🛠️ **Par Outil** : Navigation dynamique via les tags `tool:*`.


