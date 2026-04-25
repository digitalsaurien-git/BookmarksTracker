import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabase';
import SYNC_DATA from '../data/sync.json';

const STORAGE_KEY = 'bookmarks_tracker_data';

const DEFAULT_DATA = {
  activeContext: 'perso',
  folders: [],
  bookmarks: []
};

const normalizeUrl = (url) => {
  if (!url) return '';
  try {
    let u = url.trim().toLowerCase();
    u = u.replace(/^https?:\/\//, '');
    u = u.replace(/^www\./, '');
    u = u.replace(/\/$/, '');
    u = u.split('#')[0];
    return u;
  } catch (e) {
    return url.trim().toLowerCase();
  }
};

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

const mapTypeToScope = (type) => type === 'pro' ? 'boulot' : 'perso';
const mapScopeToType = (scope) => scope === 'boulot' ? 'pro' : 'perso';

export function useBookmarks(user) {
  const [data, setData] = useState(DEFAULT_DATA);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [isSyncing, setIsSyncing] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResults, setScanResults] = useState(null);

  const fetchCloudData = async () => {
    const { data: foldersData, error: foldersError } = await supabase
      .from('bt_folders')
      .select('*')
      .eq('user_id', user.id)
      .order('id');

    if (foldersError) {
        console.error("[Sync] Erreur bt_folders:", foldersError.message);
        throw foldersError;
    }

    let bookmarksData = [];
    let from = 0;
    while(true) {
        const { data, error } = await supabase
            .from('bt_bookmarks')
            .select('*')
            .eq('user_id', user.id)
            .order('id')
            .range(from, from + 999);
        
        if (error) {
            console.error("[Sync] Erreur bt_bookmarks:", error.message);
            throw error;
        }
        if (!data || data.length === 0) break;
        bookmarksData = bookmarksData.concat(data);
        from += 1000;
    }

    console.log(`[Sync] Récupéré : ${foldersData.length} dossiers, ${bookmarksData.length} favoris.`);

    if (bookmarksData.length === 0) {
        if (foldersData.length > 0) {
            console.log("[Sync] Cloud incomplet : dossiers présents mais aucun bookmark. Vérification du payload legacy.");
        }
        return false;
    }

    const loadedFolders = foldersData.map(f => ({
        id: f.id,
        name: f.name,
        parentId: f.parent_id,
        type: mapScopeToType(f.scope),
        color: f.color,
        isExpanded: f.is_expanded
    }));

    const loadedBookmarks = bookmarksData.map(b => ({
        id: b.id,
        title: b.title,
        url: b.url,
        description: b.description,
        folderId: b.folder_id,
        type: mapScopeToType(b.scope),
        tags: b.tags || [],
        isFavorite: b.is_favorite === true || String(b.is_favorite) === 'true',
        clicks: parseInt(b.clicks) || 0,
        faviconUrl: b.favicon_url,
        createdAt: b.created_at
    }));

    const favoritesCount = loadedBookmarks.filter(b => b.isFavorite).length;
    console.log(`[Sync] Mappage terminé: ${loadedBookmarks.length} favoris chargés au total.`);
    console.log(`[Sync] Dont coups de coeur détectés (isFavorite=true): ${favoritesCount}`);

    setData(prev => ({ ...prev, folders: loadedFolders, bookmarks: loadedBookmarks }));
    return true;
  };

  const performMigration = async (payload) => {
    console.log("=== DÉBUT DE LA MIGRATION VERS SUPABASE ===");
    
    // Nettoyage pré-migration : on vide les tables pour repartir sur une base propre
    console.log("-> Nettoyage des données existantes pour ce user...");
    await supabase.from('bt_bookmarks').delete().eq('user_id', user.id);
    await supabase.from('bt_folders').delete().eq('user_id', user.id);

    const rawFolders = payload.folders || [];
    const rawBookmarks = payload.bookmarks || [];
    
    console.log(`📡 Dossiers détectés dans le payload: ${rawFolders.length}`);
    console.log(`📡 Bookmarks détectés dans le payload: ${rawBookmarks.length}`);

    const folderIdMap = {};
    const newFolders = [];
    
    rawFolders.forEach(f => {
        if (!['root-perso', 'root-pro'].includes(f.id)) {
            folderIdMap[f.id] = uuidv4();
        }
    });

    rawFolders.forEach(f => {
         if (['root-perso', 'root-pro'].includes(f.id)) return;
         const scope = mapTypeToScope(f.type || payload.activeContext || 'perso');
         newFolders.push({
             id: folderIdMap[f.id],
             user_id: user.id,
             name: f.name || 'Nouveau Dossier',
             parent_id: folderIdMap[f.parentId] || null,
             scope: scope,
             color: f.color,
             is_expanded: f.isExpanded !== undefined ? f.isExpanded : true
         });
    });

    const bookmarkMap = new Map();
    let duplicatesMerged = 0;

    rawBookmarks.forEach(b => {
         const urlNorm = normalizeUrl(b.url);
         const scope = mapTypeToScope(b.type || payload.activeContext || 'perso');

         const mappedB = {
             id: uuidv4(),
             user_id: user.id,
             title: b.title || 'Sans titre',
             url: b.url,
             url_normalized: urlNorm,
             description: b.description || '',
             folder_id: folderIdMap[b.folderId] || null,
             scope: scope,
             tags: Array.isArray(b.tags) ? b.tags.filter(t=>t) : [],
             is_favorite: !!b.isFavorite,
             clicks: b.clicks || 0,
             favicon_url: b.faviconUrl || '',
         };

         if (bookmarkMap.has(urlNorm)) {
              duplicatesMerged++;
              const existing = bookmarkMap.get(urlNorm);
              
              existing.clicks += mappedB.clicks;
              existing.tags = Array.from(new Set([...existing.tags, ...mappedB.tags]));
              if (mappedB.is_favorite) existing.is_favorite = true;
              if (mappedB.description.length > existing.description.length) existing.description = mappedB.description;
              
              if (b.createdAt && existing._originalCreatedAt) {
                  if (new Date(b.createdAt) > new Date(existing._originalCreatedAt)) {
                       existing.title = mappedB.title;
                       existing.scope = mappedB.scope;
                       existing.folder_id = mappedB.folder_id;
                       existing._originalCreatedAt = b.createdAt;
                  }
              } else {
                  existing.title = mappedB.title;
                  existing.scope = mappedB.scope;
                  existing.folder_id = mappedB.folder_id;
              }
         } else {
              if (b.createdAt) mappedB._originalCreatedAt = b.createdAt;
              bookmarkMap.set(urlNorm, mappedB);
         }
    });

    const finalBookmarks = Array.from(bookmarkMap.values()).map(b => {
         delete b._originalCreatedAt;
         return b;
    });

    console.log(`🔄 Doublons URL fusionnés proprement: ${duplicatesMerged}`);
    console.log(`✅ Total Bookmarks uniques prêts pour l'insertion: ${finalBookmarks.length}`);

    try {
        if (newFolders.length > 0) {
            console.log("-> Insertion des dossiers en cours...");
            for (let i = 0; i < newFolders.length; i += 500) {
                 const { error } = await supabase.from('bt_folders').insert(newFolders.slice(i, i + 500));
                 if (error) throw error;
            }
        }
        console.log(`✅ ${newFolders.length} dossiers insérés avec succès.`);

        if (finalBookmarks.length > 0) {
            console.log("-> Insertion des favoris en cours...");
            for (let i = 0; i < finalBookmarks.length; i += 500) {
                 const { error } = await supabase.from('bt_bookmarks').insert(finalBookmarks.slice(i, i + 500));
                 if (error) throw error;
            }
        }
        console.log(`✅ ${finalBookmarks.length} favoris insérés avec succès.`);
        
        console.log("=== MIGRATION TERMINÉE AVEC SUCCÈS ===");
        return true;

    } catch (e) {
        console.error("❌ ERREUR FATALE LORS DE LA MIGRATION :", e);
        console.error("L'interface conservera en mémoire l'ancienne source par sécurité.");
        return false;
    }
  };

  useEffect(() => {
    const loadInitialData = async () => {
      if (user) {
        console.log(`[Sync] Utilisateur connecté : ${user.email} (${user.id})`);
        setIsSyncing(true);
        try {
            console.log("[Sync] Tentative de récupération des données cloud (bt_folders/bt_bookmarks)...");
            const hasNewData = await fetchCloudData();
            
            if (!hasNewData) {
                console.log("[Sync] Tables cibles vides. Recherche approfondie dans 'bookmarks_user_data'...");
                
                // 1. Diagnostic demandé : résultat brut de la requête
                const { data: userLegacy, error: legacyError } = await supabase
                    .from('bookmarks_user_data')
                    .select('*')
                    .eq('user_id', user.id);

                console.log("[Sync] Résultat brut bookmarks_user_data (pour ce user):", { 
                    data: userLegacy, 
                    error: legacyError,
                    hasPayload: userLegacy?.[0]?.payload ? 'OUI' : 'NON'
                });

                if (legacyError) {
                    console.error("[Sync] Erreur lors de la lecture de 'bookmarks_user_data' :", legacyError.message);
                }

                let legacyRow = null;
                if (userLegacy && userLegacy.length > 0) {
                    // 5. Log explicite : lignes trouvées
                    console.log(`[Sync] Legacy rows found: ${userLegacy.length}`);
                    
                    // 2. Vérifier le vrai nom des colonnes
                    console.log("[Sync] Colonnes détectées dans la table:", Object.keys(userLegacy[0]));

                    // 4. Si plusieurs lignes existent, choisir celle qui contient folders/bookmarks
                    legacyRow = userLegacy.find(row => 
                        row.payload && (row.payload.folders?.length > 0 || row.payload.bookmarks?.length > 0)
                    );

                    if (!legacyRow) {
                        console.log("[Sync] Aucun payload exploitable trouvé pour ce user.");
                        // Fallback sur la première ligne si aucune n'a de contenu (juste pour voir)
                        legacyRow = userLegacy[0];
                    }
                } else {
                    console.log("[Sync] Aucune ligne trouvée pour cet ID utilisateur.");
                    
                    // Optionnel : un petit scan global pour voir si les IDs matchent vraiment
                    const { data: globalScan } = await supabase.from('bookmarks_user_data').select('user_id').limit(5);
                    if (globalScan) {
                        console.warn("[Sync] IDs présents en DB (échantillon):", globalScan.map(r => r.user_id));
                    }
                }

                if (legacyRow?.payload) {
                    const p = legacyRow.payload;
                    const folderCount = p.folders?.length || 0;
                    const bookmarkCount = p.bookmarks?.length || 0;
                    
                    // 5. Log explicite : Payload keys
                    console.log(`[Sync] Payload keys: ${Object.keys(p).join(', ')}`);

                    if (folderCount > 0 || bookmarkCount > 0) {
                        console.log(`[Sync] Payload prêt (${folderCount} dossiers, ${bookmarkCount} favoris). Lancement de la migration...`);
                        const success = await performMigration(p);
                        if (success) {
                            console.log("[Sync] Migration terminée. Rafraîchissement...");
                            await fetchCloudData();
                        } else {
                            console.warn("[Sync] Échec migration. Utilisation mémoire.");
                            setData({
                                activeContext: p.activeContext || 'perso',
                                folders: p.folders || [],
                                bookmarks: p.bookmarks || []
                            });
                        }
                    } else {
                        console.log("[Sync] Aucun payload exploitable trouvé");
                    }
                }

                // 6. ULTIME RECOURS : Migration depuis sync.json si tout le reste est vide
                if (!legacyRow?.payload || (legacyRow.payload.bookmarks?.length === 0)) {
                    console.log("[Sync] Aucune donnée exploitable en DB. Vérification de la source locale (sync.json)...");
                    if (SYNC_DATA && SYNC_DATA.bookmarks?.length > 0) {
                        console.log(`[Sync] Source sync.json identifiée : ${SYNC_DATA.bookmarks.length} favoris trouvés.`);
                        console.log("[Sync] Lancement de la migration de secours depuis sync.json...");
                        const success = await performMigration(SYNC_DATA);
                        if (success) {
                            console.log("[Sync] Migration depuis sync.json réussie. Chargement final...");
                            await fetchCloudData();
                        } else {
                            console.error("[Sync] Échec de la migration depuis sync.json.");
                        }
                    } else {
                        console.log("[Sync] Aucune donnée trouvée dans sync.json non plus.");
                    }
                }
            } else {
                console.log("[Sync] Données cloud chargées avec succès.");
            }
        } catch (e) {
            console.error('[Sync] Erreur critique lors du chargement des données :', e);
        } finally {
            setIsSyncing(false);
        }
        return;
      }

      // Guest Mode (Fallback Local)
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setData(JSON.parse(saved));
      } else if (SYNC_DATA && SYNC_DATA.bookmarks?.length > 0) {
        setData(SYNC_DATA);
      }
    };

    loadInitialData();
  }, [user]);

  // Invité : auto-save sur LocalStorage
  useEffect(() => {
      if (!user && !isSyncing) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      }
  }, [data, user, isSyncing]);

  const setContext = (context) => {
    setData(prev => ({ ...prev, activeContext: context }));
    if (user) {
        // Optionnel : persister l'onglet actif de l'utilisateur (omission ici pour garder simple)
    }
  };

  const addFolder = async (name, parentId = null) => {
    const parentFolder = data.folders.find(f => f.id === parentId);
    if (parentFolder && parentFolder.parentId !== null) parentId = parentFolder.parentId;

    const scope = mapTypeToScope(parentFolder ? parentFolder.type : data.activeContext);
    const color = '#3b82f6'; // Replace dynamic logic here to avoid complex DOM references

    if (user) {
        const { data: inserted, error } = await supabase.from('bt_folders').insert({
            user_id: user.id,
            name,
            parent_id: parentId,
            scope: scope,
            color: color,
            is_expanded: true
        }).select().single();

        if (error) { console.error("Error adding folder", error); return; }
        setData(prev => ({
            ...prev,
            folders: [...prev.folders, { id: inserted.id, name: inserted.name, parentId: inserted.parent_id, type: mapScopeToType(inserted.scope), color: inserted.color, isExpanded: inserted.is_expanded }]
        }));
    } else {
        const id = uuidv4();
        setData(prev => ({
            ...prev,
            folders: [...prev.folders, { id, name, parentId, type: data.activeContext, color, isExpanded: true }]
        }));
    }
  };

  const deleteFolder = async (folderId) => {
    if (user) {
        const { error } = await supabase.from('bt_folders').delete().eq('id', folderId);
        if (error) { console.error("Error deleting folder", error); return; }
    }
    setData(prev => ({
      ...prev,
      folders: prev.folders.filter(f => f.id !== folderId),
      bookmarks: prev.bookmarks.map(b => b.folderId === folderId ? { ...b, folderId: null } : b)
    }));
  };

  const renameFolder = async (folderId, newName) => {
    if (user) {
        const { error } = await supabase.from('bt_folders').update({ name: newName }).eq('id', folderId);
        if (error) { console.error("Error renaming folder", error); return; }
    }
    setData(prev => ({
      ...prev,
      folders: prev.folders.map(f => f.id === folderId ? { ...f, name: newName } : f)
    }));
  };

  const toggleFolderExpand = async (folderId) => {
    const folder = data.folders.find(f => f.id === folderId);
    if (!folder) return;
    
    if (user) {
        supabase.from('bt_folders').update({ is_expanded: !folder.isExpanded }).eq('id', folderId).then();
    }
    setData(prev => ({
      ...prev,
      folders: prev.folders.map(f => f.id === folderId ? { ...f, isExpanded: !f.isExpanded } : f)
    }));
  };

  const addBookmark = async (bookmark) => {
    const scope = mapTypeToScope(data.activeContext);
    const tags = Array.isArray(bookmark.tags) ? bookmark.tags : 
                (typeof bookmark.tags === 'string' ? bookmark.tags.split(',').map(t => t.trim()).filter(Boolean) : []);
    const urlNorm = normalizeUrl(bookmark.url);

    if (user) {
        const { data: inserted, error } = await supabase.from('bt_bookmarks').insert({
            user_id: user.id,
            title: bookmark.title || 'Sans titre',
            url: bookmark.url || '',
            url_normalized: urlNorm,
            description: bookmark.description || '',
            folder_id: bookmark.folderId || null,
            scope: scope,
            tags: tags,
            is_favorite: !!bookmark.isFavorite,
            favicon_url: bookmark.faviconUrl || ''
        }).select().single();

        if (error) { console.error("Error adding bookmark", error); return; }
        
        setData(prev => ({
            ...prev,
            bookmarks: [...prev.bookmarks, {
                 id: inserted.id,
                 title: inserted.title,
                 url: inserted.url,
                 description: inserted.description,
                 folderId: inserted.folder_id,
                 type: mapScopeToType(inserted.scope),
                 tags: inserted.tags,
                 isFavorite: inserted.is_favorite,
                 clicks: inserted.clicks,
                 faviconUrl: inserted.favicon_url,
                 createdAt: inserted.created_at
            }]
        }));
    } else {
        const id = uuidv4();
        setData(prev => ({
            ...prev,
            bookmarks: [...prev.bookmarks, { id, ...bookmark, type: data.activeContext, tags, isFavorite: !!bookmark.isFavorite, clicks: 0, createdAt: new Date().toISOString() }]
        }));
    }
  };

  const deleteBookmark = async (id) => {
    if (user) {
        const { error } = await supabase.from('bt_bookmarks').delete().eq('id', id);
        if (error) { console.error("Error deleting bookmark", error); return; }
    }
    setData(prev => ({
      ...prev,
      bookmarks: prev.bookmarks.filter(b => b.id !== id)
    }));
  };

  const moveBookmark = async (id, newFolderId) => {
    if (user) {
        const { error } = await supabase.from('bt_bookmarks').update({ folder_id: newFolderId }).eq('id', id);
        if (error) { console.error("Error moving bookmark", error); return; }
    }
    setData(prev => ({
      ...prev,
      bookmarks: prev.bookmarks.map(b => b.id === id ? { ...b, folderId: newFolderId } : b)
    }));
  };

  const updateBookmark = async (id, updates) => {
    if (user) {
        const dbUpdates = {};
        if (updates.title !== undefined) dbUpdates.title = updates.title;
        if (updates.description !== undefined) dbUpdates.description = updates.description;
        if (updates.isFavorite !== undefined) dbUpdates.is_favorite = updates.isFavorite;
        if (updates.tags !== undefined) dbUpdates.tags = updates.tags;
        if (updates.url !== undefined) {
             dbUpdates.url = updates.url;
             dbUpdates.url_normalized = normalizeUrl(updates.url);
        }

        const { error } = await supabase.from('bt_bookmarks').update(dbUpdates).eq('id', id);
        if (error) { console.error("Error updating bookmark", error); return; }
    }
    setData(prev => ({
      ...prev,
      bookmarks: prev.bookmarks.map(b => b.id === id ? { ...b, ...updates } : b)
    }));
  };

  const incrementClickCount = async (id) => {
    const b = data.bookmarks.find(b => b.id === id);
    if (!b) return;

    if (user) {
        supabase.from('bt_bookmarks').update({ clicks: b.clicks + 1 }).eq('id', id).then();
    }
    setData(prev => ({
      ...prev,
      bookmarks: prev.bookmarks.map(x => x.id === id ? { ...x, clicks: x.clicks + 1 } : x)
    }));
  };

  const moveFolder = async (folderId, newParentId) => {
    if (folderId === newParentId) return;
    if (user) {
         const { error } = await supabase.from('bt_folders').update({ parent_id: newParentId }).eq('id', folderId);
         if (error) { console.error("Error moving folder", error); return; }
    }
    setData(prev => ({
      ...prev,
      folders: prev.folders.map(f => f.id === folderId ? { ...f, parentId: newParentId } : f)
    }));
  };

  const bulkDelete = async (ids) => {
     if (user) {
         const { error } = await supabase.from('bt_bookmarks').delete().in('id', ids);
         if (error) { console.error("Error in bulk delete", error); return; }
     }
     setData(prev => ({
        ...prev,
        bookmarks: prev.bookmarks.filter(b => !ids.includes(b.id))
     }));
     if (scanResults) {
        setScanResults({
          ...scanResults,
          dead: scanResults.dead.filter(d => !ids.includes(d.id))
        });
      }
  };

  const hiddenFolderNames = ['Perso', 'Boulot', ':: Perso ::', ':: Boulot ::'];
  const folderMap = new Map(data.folders.map(f => [f.id, f]));
  
  const getEffectiveParentId = (folderId) => {
      let currentId = folderId;
      while (currentId) {
          const folder = folderMap.get(currentId);
          if (folder && hiddenFolderNames.includes(folder.name.trim())) {
              currentId = folder.parentId;
          } else {
              break;
          }
      }
      return currentId;
  };

  const effectiveFolders = data.folders
    .filter(f => !hiddenFolderNames.includes(f.name.trim()))
    .map(f => ({ ...f, parentId: getEffectiveParentId(f.parentId) }));

  const effectiveBookmarks = data.bookmarks.map(b => ({
      ...b,
      folderId: getEffectiveParentId(b.folderId)
  }));

  const getFolderCounts = useCallback((folderId) => {
    const directCount = effectiveBookmarks.filter(b => b.folderId === folderId).length;
    const childFolders = effectiveFolders.filter(f => f.parentId === folderId);
    const subCount = childFolders.reduce((sum, f) => sum + getFolderCounts(f.id).total, 0);
    return {
      direct: directCount,
      total: directCount + subCount
    };
  }, [effectiveBookmarks, effectiveFolders]);

  const getContextCount = (context) => {
    return effectiveBookmarks.filter(b => b.type === context).length;
  };

  const filteredBookmarks = effectiveBookmarks.filter(b => {
    const itemType = b.type || 'perso';
    const contextMatch = itemType === data.activeContext;
    const query = (searchQuery || '').toLowerCase();
    
    let filterMatch = true;
    if (activeFilter === 'favorites') filterMatch = b.isFavorite;
    else if (activeFilter === 'daily') filterMatch = (b.tags || []).includes('usage:quotidien');
    else if (activeFilter === 'popular') {
      const top10Ids = [...effectiveBookmarks]
        .filter(x => x.type === data.activeContext && x.clicks > 0)
        .sort((a, b) => (b.clicks || 0) - (a.clicks || 0))
        .slice(0, 10)
        .map(x => x.id);
      filterMatch = top10Ids.includes(b.id);
    }
    
    const searchMatch = !query || 
                       (b.title || '').toLowerCase().includes(query) || 
                       (b.url || '').toLowerCase().includes(query) ||
                       (b.description || '').toLowerCase().includes(query) ||
                       (Array.isArray(b.tags) ? b.tags : []).some(t => (t || '').toLowerCase().includes(query));
    
    return contextMatch && filterMatch && searchMatch;
  });

  const popularBookmarks = [...effectiveBookmarks]
    .filter(b => b.type === data.activeContext && b.clicks > 0)
    .sort((a, b) => (b.clicks || 0) - (a.clicks || 0))
    .slice(0, 10);

  const scanDeadLinks = async (onProgress) => {
    setIsScanning(true);
    const results = { dead: [], ok: [], total: data.bookmarks.length };
    const all = data.bookmarks;
    
    for (let i = 0; i < all.length; i++) {
        const b = all[i];
        if (onProgress) onProgress(i + 1, all.length, b.title);
        try {
            await fetch(b.url, { mode: 'no-cors', cache: 'no-store' });
            results.ok.push(b.id);
        } catch (e) {
            results.dead.push({ id: b.id, title: b.title, url: b.url });
        }
    }
    
    setScanResults(results);
    setIsScanning(false);
    return results;
  };

  const runDiagnostics = async () => {
    const results = {
      supabase: 'Vérification...',
      localStorage: 'OK',
      timestamp: new Date().toISOString()
    };
    try {
      if (user) {
        const { error } = await supabase.from('bt_bookmarks').select('count', { count: 'exact', head: true }).eq('user_id', user.id);
        results.supabase = error ? `Erreur: ${error.message}` : 'PostgreSQL: Connecté & Opérationnel';
      } else {
        results.supabase = 'Mode Invité (Local)';
      }
    } catch (e) {
      results.supabase = 'Échec de connexion';
    }
    return results;
  };

  const analyzeImport = (incomingBookmarks) => {
    const results = { ambiguous: [], toUpdate: 0, toCreate: 0 };
    
    incomingBookmarks.forEach(incoming => {
      const urlNorm = normalizeUrl(incoming.url);
      const existing = data.bookmarks.find(b => normalizeUrl(b.url) === urlNorm);
      
      if (existing) {
        const titleDiffers = incoming.title && existing.title && incoming.title.toLowerCase() !== existing.title.toLowerCase();
        const descMuchLonger = (incoming.description || '').length > (existing.description || '').length + 10;
        
        if (titleDiffers || descMuchLonger) {
          results.ambiguous.push({ incoming, existing });
        } else {
          results.toUpdate++;
        }
      } else {
        results.toCreate++;
      }
    });
    return results;
  };

  const commitSmartImport = async (incomingBookmarks, choices) => {
    for (const b of incomingBookmarks) {
      const urlNorm = normalizeUrl(b.url);
      const existing = data.bookmarks.find(x => normalizeUrl(x.url) === urlNorm);
      const choice = choices.find(c => c.url === b.url);
      
      if (choice && choice.action === 'skip') continue;
      
      const bTags = Array.isArray(b.tags) ? b.tags : (typeof b.tags === 'string' ? b.tags.split(',') : []);
      
      if (existing) {
        const mergedTags = Array.from(new Set([...(existing.tags || []), ...bTags.filter(Boolean)]));
        const updates = { tags: mergedTags };
        
        if ((b.description || '').length > (existing.description || '').length) {
          updates.description = b.description;
        }
        if (choice && choice.action === 'update') {
          updates.title = b.title || existing.title;
        }
        await updateBookmark(existing.id, updates);
      } else {
        // Resolve folder ID from dossier::: tags
        let targetFolderId = null;
        const folderTags = bTags.filter(t => typeof t === 'string' && t.startsWith('dossier::: '));
        if (folderTags.length > 0) {
            // Usually the last tag is the deepest folder
            const folderName = folderTags[folderTags.length - 1].replace('dossier::: ', '').trim();
            const targetFolder = data.folders.find(f => f.name.trim() === folderName && (f.type || 'perso') === data.activeContext);
            if (targetFolder) {
                targetFolderId = targetFolder.id;
            }
        }
        
        const newBookmark = { ...b, tags: bTags, folderId: targetFolderId };
        await addBookmark(newBookmark);
      }
    }
  };

  return {
    data,
    activeContext: data.activeContext,
    setContext,
    folders: effectiveFolders
      .filter(f => (f.type || 'perso') === data.activeContext)
      .sort((a, b) => a.name.localeCompare(b.name)),
    bookmarks: filteredBookmarks,
    allBookmarks: effectiveBookmarks,
    addFolder,
    deleteFolder,
    toggleFolderExpand,
    moveFolder,
    renameFolder,
    addBookmark,
    deleteBookmark,
    moveBookmark,
    updateBookmark,
    incrementClickCount,
    getFolderCounts,
    getContextCount,
    activeFilter,
    setActiveFilter,
    popularBookmarks,
    projects: [...new Set(
      effectiveBookmarks
        .filter(b => b.type === data.activeContext)
        .flatMap(b => Array.isArray(b.tags) ? b.tags : [])
        .filter(t => t.startsWith('projet:'))
    )],
    searchQuery,
    setSearchQuery,
    isSyncing,
    runDiagnostics,
    scanDeadLinks,
    isScanning,
    scanResults,
    setScanResults,
    bulkDelete,
    analyzeImport,
    commitSmartImport
  };
}
