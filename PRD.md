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
- **Synchronisation Secours (GitHub Bridge)** : Utilisation d'un fichier `src/data/sync.json` comme point de passage Git entre les postes pour contourner les restrictions réseau/proxy.

## 8) Plan de mission (etapes en langage humain)
1. **Toggle Perso/Boulot** : L’utilisateur bascule entre ses deux espaces de travail via un bouton dédié.
2. **Arborescence Propre** : Les dossiers racines redondants "Favoris Perso/Pro" sont supprimés ; le contenu remonte directement au premier niveau.
3. **Ajout et affichage de bookmarks** : Peut ajouter un bookmark (champ + bouton) et il apparaît dans le dossier choisi.
4. **Tag & recherche** : Peut assigner un tag lors de l’ajout, puis retrouve le lien via un champ de recherche.
5. **Déplacement & Restructuration** : Peut déplacer un lien ou un dossier entier par glisser-déposer (Drag & Drop) vers un nouveau dossier ou vers la racine.
6. **Export/import** : Peut sauvegarder tous ses bookmarks en un clic (fichier téléchargé) et réimporter ce fichier pour retrouver la structure.
7. **Migration** : Les anciens dossiers "Perso" et "Pro" sont aplatis lors de la première utilisation.
8. **GitHub Sync Bridge** : Possibilité d'importer les favoris depuis un fichier JSON synchronisé via Git pour les environnements pro restreints.

## 9) Preuves attendues (pour valider sans technique)
- Capture d’écran montrant l'arborescence unifiée.
- Vidéo ou gif court montrant l’ajout, la recherche, et le déplacement d’un bookmark.
- Fichier d’export JSON au format compatible GitHub Sync.
- Bouton "Sync via GitHub" fonctionnel sur le poste pro.

## 10) Checklist de validation (pass/fail)
- [x] Je peux basculer instantanément entre l'espace Perso et Boulot.
- [x] L'arborescence est "propre" (pas de dossier racine redondant au sommet).
- [x] Je peux créer un dossier et il s’ajoute instantanément dans l'espace actif.
- [x] Cliquer on un bookmark ouvre bien le site correspondant.
- [x] Rechercher un mot-clef affiche bien tous les liens/tag correspondants.
- [x] Je peux déplacer un lien d’un dossier à un autre.
- [x] Je peux taguer un lien, puis filtres par ce tag l’affichent bien.
- [x] Un bouton “Exporter” sauvegarde tous mes liens dans un fichier (ou via Git).
- [x] Un bouton “Importer” restaure bien toute ma structure de bookmarks.
- [x] Tout fonctionne sans connexion internet (cache local).
- [x] **NOUVEAU** : Je peux synchroniser mes données via GitHub sur un poste pro restreint.

---

## 11) Fonctionnalités développées (Status au 13/04/2026)

### ✅ Core & Navigation
- **Architecture Multi-Contexte** : Séparation complète Perso / Pro avec toggle instantané.
- **Explorateur Récursif** : Gestion d'arborescence de dossiers avec Drag & Drop (Folders & Bookmarks).
- **Navigation Intelligente** : Vues par défaut (Bibliothèque, Favoris, Usage Quotidien, Popularité).

### ✅ Gestion des Favoris
- **CRUD Complet** : Ajout, édition détaillée et suppression.
- **Système de Tags Structurés** : Catégorisation guidée (`tool:`, `usage:`, `status:`, `projet:`, `prio:`, `type:`).
- **Récupération Auto** : Auto-completion du titre et de la favicon via l'URL.
- **Filtrage Dynamique** : Recherche ultra-rapide sur titres, URLs, descriptions et tags.

### ✅ Synchronisation & Import/Export
- **Cloud Sync** : Intégration Supabase pour la persistence temps-réel.
- **GitHub Bridge** : Synchronisation via fichier `sync.json` pour les environnements pro restreints.
- **Import Intelligent** : Parseur avec détection de doublons, détection d'ambiguïté et politique de fusion dimensionnelle.
- **Export Universel** : Exportation HTML compatible navigateurs.

### ✅ Design & UX
- **Design "Sober Premium"** : Look minimaliste, glassmorphism, animations fluides (Framer Motion).
- **Feedback Visuel** : Compteurs automatiques, badges de popularité, favicons de haute qualité.

### ✅ Maintenance & Qualité de Données
- **Scanner de Liens Morts** : Moteur de vérification d'accessibilité (mode ping) pour l'ensemble des favoris.
- **Gestion des Erreurs en Masse** : Interface permettant de sélectionner et supprimer les liens morts en un clic.
- **Outil de Diagnostic** : Panneau de contrôle vérifiant l'état de connexion Supabase, LocalStorage et GitHub Bridge.
- **UI Menu Correction** : Amélioration du positionnement des menus contextuels pour une accessibilité totale sur toutes les vignettes.

### ✅ Optimisations UI & Tri
- **Tri Intelligent** : Dossiers classés alphabétiquement et favoris classés par popularité (clics) par défaut.
- **Sidebar Compacte** : Transformation des tags projets en menu déroulant et réduction générale des polices.
- **Hiérarchie Stricte** : Les sous-dossiers sont désormais proprement imbriqués et masqués de la racine.
- **Design Épuré** : Suppression des tags sur les vignettes pour maximiser l'espace et lisibilité accrue des titres (multi-ligne).
- **Grille Dynamique** : Passage à 3 colonnes pour un confort de lecture optimal sur grand écran.

---

## 12) Roadmap Successive
1. [x] MVP Local
2. [x] Intégration Supabase
3. [x] Système de Tags Structurés
4. [x] Import Intelligent & Sync Git
5. [x] Maintenance, Diagnostic & Nettoyage
6. [x] **NOUVEAU** : Optimisation UI, Tri & Hiérarchie.
7. [ ] **SUIVANT** : Extensions navigateur (Chrome/Firefox).

---



