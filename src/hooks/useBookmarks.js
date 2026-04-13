import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabase';
import SYNC_DATA from '../data/sync.json';

const STORAGE_KEY = 'bookmarks_tracker_data';

const DEFAULT_DATA = {
  activeContext: 'perso', // 'perso' or 'pro'
  folders: [],
  bookmarks: []
};

const normalizeUrl = (url) => {
  if (!url) return '';
  try {
    let u = url.trim().toLowerCase();
    // Remove protocol
    u = u.replace(/^https?:\/\//, '');
    // Remove www.
    u = u.replace(/^www\./, '');
    // Remove trailing slash
    u = u.replace(/\/$/, '');
    // Remove hash/fragments if they don't look important (simple version)
    u = u.split('#')[0];
    return u;
  } catch (e) {
    return url.trim().toLowerCase();
  }
};

export function useBookmarks(user) {
  const [data, setData] = useState(DEFAULT_DATA);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'favorites', 'daily', 'popular'
  const [isSyncing, setIsSyncing] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResults, setScanResults] = useState(null);

  // Load data & Migration
  useEffect(() => {
    const processData = (loadedData) => {
      let migrated = false;
      let newFolders = [...loadedData.folders];
      let newBookmarks = [...loadedData.bookmarks];

      // Restore activeContext if missing
      if (!loadedData.activeContext) {
        loadedData.activeContext = 'perso';
        migrated = true;
      }

      // 1. Identify root folders to remove
      const rootIds = ['root-perso', 'root-pro'];
      const rootsExist = newFolders.some(f => rootIds.includes(f.id));

      if (rootsExist) {
        // Move children of roots to top-level (parentId = null)
        newFolders = newFolders.map(f => {
          if (rootIds.includes(f.parentId)) {
            migrated = true;
            return { ...f, parentId: null };
          }
          return f;
        });

        // Move bookmarks of roots to root (folderId = null)
        newBookmarks = newBookmarks.map(b => {
          if (rootIds.includes(b.folderId)) {
            migrated = true;
            return { ...b, folderId: null };
          }
          return b;
        });

        // Remove the root folders themselves
        const filteredFolders = newFolders.filter(f => !rootIds.includes(f.id));
        if (filteredFolders.length !== newFolders.length) {
          migrated = true;
          newFolders = filteredFolders;
        }
      }

      // 3. New Migration: Flatten any folders > 2 levels deep
      const findDepth = (fid, currentFolders) => {
        let depth = 0;
        let current = currentFolders.find(f => f.id === fid);
        while (current && current.parentId) {
          depth++;
          current = currentFolders.find(f => f.id === current.parentId);
        }
        return depth;
      };

      let deepFoldersFound = false;
      newFolders = newFolders.map(f => {
        const depth = findDepth(f.id, newFolders);
        if (depth > 1) { // 0: Root, 1: Subfolder, >1: Too deep
          deepFoldersFound = true;
          migrated = true;
          // Find root ancestor for this folder to move it to level 1
          let ancestor = newFolders.find(x => x.id === f.parentId);
          while (ancestor && ancestor.parentId) {
            ancestor = newFolders.find(x => x.id === ancestor.parentId);
          }
          return { ...f, parentId: ancestor ? ancestor.id : null };
        }
        return f;
      });

      if (migrated) {
        const finalData = { ...loadedData, folders: newFolders, bookmarks: newBookmarks };
        saveChanges(finalData);
        return finalData;
      }
      return loadedData;
    };

    if (!user) {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setData(processData(parsed));
      }
      return;
    }

    const loadCloudData = async () => {
      setIsSyncing(true);
      try {
        // Check if we are offline or if Supabase is blocked
        const { data: cloudData, error } = await supabase
          .from('bookmarks_user_data')
          .select('payload')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          throw error;
        }

        if (cloudData?.payload) {
          setData(processData(cloudData.payload));
        } else {
          // Fallback 1: LocalStorage
          const localSaved = localStorage.getItem(STORAGE_KEY);
          if (localSaved) {
            const parsed = JSON.parse(localSaved);
            const processed = processData(parsed);
            setData(processed);
            // Try to sync to cloud if possible
            await supabase.from('bookmarks_user_data').insert({
              user_id: user.id,
              payload: processed,
              updated_at: new Date().toISOString()
            }).catch(() => console.log("Not possible to sync to cloud at the moment (likely network restrictions)."));
          } else if (SYNC_DATA && SYNC_DATA.bookmarks?.length > 0) {
            // Fallback 2: GitHub Sync File (for professional environments)
            console.log("Initializing from GitHub sync file...");
            const processed = processData(SYNC_DATA);
            setData(processed);
            saveChanges(processed);
          }
        }
      } catch (e) {
        console.error('Error loading cloud data (Network/Proxy issues possible):', e);
        // On error, still check local and sync file
        const localSaved = localStorage.getItem(STORAGE_KEY);
        if (localSaved) {
          setData(processData(JSON.parse(localSaved)));
        } else if (SYNC_DATA && SYNC_DATA.bookmarks?.length > 0) {
          setData(processData(SYNC_DATA));
        }
      } finally {
        setIsSyncing(false);
      }
    };

    loadCloudData();
  }, [user]);

  // Save data helper (Cloud + Local)
  const saveChanges = useCallback(async (newData) => {
    setData(newData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));

    if (user) {
      try {
        await supabase.from('bookmarks_user_data').upsert({
          user_id: user.id,
          payload: newData,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });
      } catch (e) {
        console.error('Error saving to cloud:', e);
      }
    }
  }, [user]);


  const setContext = (context) => {
    saveChanges({ ...data, activeContext: context });
  };

  const runDiagnostics = async () => {
    const results = {
      supabase: 'Vérification...',
      localStorage: 'OK',
      syncFile: SYNC_DATA ? 'Présent' : 'Absent',
      timestamp: new Date().toISOString()
    };

    try {
      if (user) {
        // Simple connectivity & permission check
        const { error } = await supabase.from('bookmarks_user_data').select('count', { count: 'exact', head: true }).eq('user_id', user);
        results.supabase = error ? `Erreur: ${error.message}` : 'Connecté & Opérationnel';
      } else {
        results.supabase = 'Mode Invité (Pas de Cloud)';
      }
    } catch (e) {
      results.supabase = 'Échec de connexion au service cloud';
    }
    return results;
  };

  const scanDeadLinks = async (onProgress) => {
    setIsScanning(true);
    const results = { dead: [], ok: [], total: data.bookmarks.length };
    const all = data.bookmarks;
    
    for (let i = 0; i < all.length; i++) {
        const b = all[i];
        if (onProgress) onProgress(i + 1, all.length, b.title);
        
        try {
            // Mode no-cors permet de voir si le serveur répond sans erreur réseau fatale
            // Si le lien est mort (404, DNS error), fetch lèvera une exception
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

  const FOLDER_COLORS = [
    'text-blue-500', 'text-emerald-500', 'text-rose-500', 
    'text-amber-500', 'text-indigo-500', 'text-violet-500',
    'text-cyan-500', 'text-orange-500'
  ];

  const addFolder = (name, parentId = null) => {
    // Check level: Parent must not have a parent (limit traversal to 1 level deep)
    const parentFolder = data.folders.find(f => f.id === parentId);
    if (parentFolder && parentFolder.parentId !== null) {
      // Trying to add a 3rd level folder? Reject or add at the same level
      parentId = parentFolder.parentId;
    }

    const newFolder = {
      id: 'folder-' + Date.now().toString(),
      name,
      parentId,
      type: parentFolder ? parentFolder.type : data.activeContext,
      color: FOLDER_COLORS[Math.floor(Math.random() * FOLDER_COLORS.length)],
      isExpanded: true
    };
    saveChanges({
      ...data,
      folders: [...data.folders, newFolder]
    });
  };

  const toggleFolderExpand = (folderId) => {
    saveChanges({
      ...data,
      folders: data.folders.map(f => f.id === folderId ? { ...f, isExpanded: !f.isExpanded } : f)
    });
  };

  const deleteFolder = (folderId) => {
    saveChanges({
      ...data,
      folders: data.folders.filter(f => f.id !== folderId),
      bookmarks: data.bookmarks.filter(b => b.folderId !== folderId)
    });
  };

  const renameFolder = (folderId, newName) => {
    saveChanges({
      ...data,
      folders: data.folders.map(f => f.id === folderId ? { ...f, name: newName } : f)
    });
  };

  const addBookmark = (bookmark) => {
    const newBookmark = {
      id: 'bookmark-' + Date.now().toString(),
      title: bookmark.title || '',
      url: bookmark.url || '',
      description: bookmark.description || '',
      folderId: bookmark.folderId || null,
      type: data.activeContext,
      tags: Array.isArray(bookmark.tags) ? bookmark.tags : 
            (typeof bookmark.tags === 'string' ? bookmark.tags.split(',').map(t => t.trim()).filter(Boolean) : []),
      isFavorite: !!bookmark.isFavorite,
      clicks: 0,
      faviconUrl: bookmark.faviconUrl || '',
      createdAt: new Date().toISOString()
    };
    saveChanges({
      ...data,
      bookmarks: [...data.bookmarks, newBookmark]
    });
  };

  const deleteBookmark = (id) => {
    saveChanges({
      ...data,
      bookmarks: data.bookmarks.filter(b => b.id !== id)
    });
  };

  const moveBookmark = (id, newFolderId) => {
    saveChanges({
      ...data,
      bookmarks: data.bookmarks.map(b => b.id === id ? { ...b, folderId: newFolderId } : b)
    });
  };

  const updateBookmark = (id, updates) => {
    saveChanges({
      ...data,
      bookmarks: data.bookmarks.map(b => b.id === id ? { ...b, ...updates } : b)
    });
  };

  const incrementClickCount = (id) => {
    saveChanges({
      ...data,
      bookmarks: data.bookmarks.map(b => b.id === id ? { ...b, clicks: (b.clicks || 0) + 1 } : b)
    });
  };

  const moveFolder = (folderId, newParentId) => {
    if (folderId === newParentId) return;
    saveChanges({
      ...data,
      folders: data.folders.map(f => f.id === folderId ? { ...f, parentId: newParentId } : f)
    });
  };

  const getFolderCounts = useCallback((folderId) => {
    const directCount = data.bookmarks.filter(b => b.folderId === folderId).length;
    const childFolders = data.folders.filter(f => f.parentId === folderId);
    const subCount = childFolders.reduce((sum, f) => sum + getFolderCounts(f.id).total, 0);
    return {
      direct: directCount,
      total: directCount + subCount
    };
  }, [data.bookmarks, data.folders]);

  const getContextCount = (context) => {
    return data.bookmarks.filter(b => b.type === context).length;
  };

  const filteredBookmarks = data.bookmarks.filter(b => {
    const contextMatch = b.type === data.activeContext;
    const query = (searchQuery || '').toLowerCase();
    
    // Combined filtering logic
    let filterMatch = true;
    if (activeFilter === 'favorites') filterMatch = b.isFavorite;
    else if (activeFilter === 'daily') filterMatch = (b.tags || []).includes('usage:quotidien');
    else if (activeFilter === 'popular') {
      // Return top 10 in popular view
      const top10Ids = [...data.bookmarks]
        .filter(x => x.type === data.activeContext && x.clicks > 0)
        .sort((a, b) => (b.clicks || 0) - (a.clicks || 0))
        .slice(0, 10)
        .map(x => x.id);
      filterMatch = top10Ids.includes(b.id);
    }
    
    // Default secondary filter: if no search or special view, internal MainContent will sort by hits
    const searchMatch = !query || 
                       (b.title || '').toLowerCase().includes(query) || 
                       (b.url || '').toLowerCase().includes(query) ||
                       (b.description || '').toLowerCase().includes(query) ||
                       (Array.isArray(b.tags) ? b.tags : []).some(t => (t || '').toLowerCase().includes(query));
    
    return contextMatch && filterMatch && searchMatch;
  });

  // Special view for popularity (Top 10)
  const popularBookmarks = [...data.bookmarks]
    .filter(b => b.type === data.activeContext && b.clicks > 0)
    .sort((a, b) => (b.clicks || 0) - (a.clicks || 0))
    .slice(0, 10);

  return {
    data,
    activeContext: data.activeContext,
    setContext,
    folders: data.folders
      .filter(f => f.type === data.activeContext)
      .sort((a, b) => a.name.localeCompare(b.name)),
    bookmarks: filteredBookmarks,
    allBookmarks: data.bookmarks,
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
      data.bookmarks
        .filter(b => b.type === data.activeContext)
        .flatMap(b => Array.isArray(b.tags) ? b.tags : [])
        .filter(t => t.startsWith('projet:'))
    )],
    searchQuery,
    setSearchQuery,
    isSyncing,
    importData: (newData) => saveChanges(newData),
    exportData: () => JSON.stringify(data, null, 2),
    forceSyncFromFile: () => {
      if (SYNC_DATA && confirm("Voulez-vous écraser vos favoris locaux par ceux du fichier de synchronisation GitHub ?")) {
        const processed = processData(SYNC_DATA);
        saveChanges(processed);
        return true;
      }
      return false;
    },
    analyzeImport: (importedBookmarks) => {
      const results = {
        recognized: 0,
        toCreate: 0,
        toUpdate: 0,
        ambiguous: [], // Cases needing review
        simpleUpdates: []
      };

      importedBookmarks.forEach(ib => {
        const normIb = normalizeUrl(ib.url);
        const existing = data.bookmarks.find(b => normalizeUrl(b.url) === normIb);
        
        if (existing) {
          results.recognized++;
          
          // Ambiguity detection
          const titleDiff = (ib.title && existing.title && ib.title.toLowerCase().trim() !== existing.title.toLowerCase().trim());
          const descConflict = (ib.description && existing.description && ib.description.trim() !== existing.description.trim() && existing.description.length > 10);
          
          // Count dimension changes
          const existingDims = (existing.tags || []).filter(t => t.includes(':')).map(t => t.split(':')[0]);
          const incomingDims = (ib.tags || []).filter(t => t.includes(':')).map(t => t.split(':')[0]);
          const changedDims = incomingDims.filter(d => {
            const oldVal = (existing.tags || []).find(t => t.startsWith(`${d}:`));
            const newVal = (ib.tags || []).find(t => t.startsWith(`${d}:`));
            return oldVal !== newVal;
          });

          if (titleDiff || descConflict || changedDims.length >= 3) {
            results.ambiguous.push({ existing, incoming: ib, reasons: { titleDiff, descConflict, changedDims } });
          } else {
            results.toUpdate++;
            results.simpleUpdates.push({ existing, incoming: ib });
          }
        } else {
          results.toCreate++;
        }
      });
      return results;
    },
    commitSmartImport: (importedBookmarks, manualChoices = []) => {
      let updatedBookmarks = [...data.bookmarks];
      const newBookmarks = [];

      importedBookmarks.forEach(ib => {
        const normIb = normalizeUrl(ib.url);
        const index = updatedBookmarks.findIndex(b => normalizeUrl(b.url) === normIb);

        if (index !== -1) {
          const existing = updatedBookmarks[index];
          const choice = manualChoices.find(c => normalizeUrl(c.url) === normIb);
          
          if (choice && choice.action === 'skip') return;

          // Smart Tag Merge Policy
          const existingTags = existing.tags || [];
          const incomingTags = ib.tags || [];
          
          // Split into dimensions and free tags
          const existingDimMap = {};
          const freeTags = [];
          existingTags.forEach(t => {
            if (t.includes(':')) {
              const [k, v] = t.split(':');
              existingDimMap[k] = v;
            } else {
              freeTags.push(t);
            }
          });

          incomingTags.forEach(t => {
            if (t.includes(':')) {
              const [k, v] = t.split(':');
              // OVERWRITE the dimension with incoming value
              existingDimMap[k] = v;
            } else {
              if (!freeTags.includes(t)) freeTags.push(t);
            }
          });

          const finalTags = [
            ...Object.entries(existingDimMap).map(([k, v]) => `${k}:${v}`),
            ...freeTags
          ];

          updatedBookmarks[index] = {
            ...existing,
            title: ib.title || existing.title,
            description: ib.description || existing.description,
            tags: finalTags,
            isFavorite: ib.isFavorite !== undefined ? ib.isFavorite : existing.isFavorite,
          };
        } else {
          // Create new
          newBookmarks.push({
            id: 'bookmark-' + Date.now().toString() + Math.random().toString(36).substr(2, 9),
            title: ib.title || 'Sans titre',
            url: ib.url,
            description: ib.description || '',
            tags: ib.tags || [],
            type: data.activeContext,
            createdAt: new Date().toISOString(),
            clicks: 0
          });
        }
      });

      saveChanges({
        ...data,
        bookmarks: [...updatedBookmarks, ...newBookmarks]
      });
    },
    runDiagnostics,
    scanDeadLinks,
    isScanning,
    scanResults,
    setScanResults,
    bulkDelete: (ids) => {
      saveChanges({
        ...data,
        bookmarks: data.bookmarks.filter(b => !ids.includes(b.id))
      });
      if (scanResults) {
        setScanResults({
          ...scanResults,
          dead: scanResults.dead.filter(d => !ids.includes(d.id))
        });
      }
    }
  };
}

