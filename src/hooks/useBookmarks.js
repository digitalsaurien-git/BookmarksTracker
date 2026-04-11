import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabase';

const STORAGE_KEY = 'bookmarks_tracker_data';

const DEFAULT_DATA = {
  activeContext: 'perso', // 'perso' or 'pro'
  folders: [],
  bookmarks: []
};

export function useBookmarks(user) {
  const [data, setData] = useState(DEFAULT_DATA);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'favorites', 'daily', 'popular'
  const [isSyncing, setIsSyncing] = useState(false);

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

      // 2. Assign colors to folders if missing
      newFolders = newFolders.map(f => {
        if (!f.color) {
          migrated = true;
          return { ...f, color: FOLDER_COLORS[Math.floor(Math.random() * FOLDER_COLORS.length)] };
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
          const localSaved = localStorage.getItem(STORAGE_KEY);
          if (localSaved) {
            const parsed = JSON.parse(localSaved);
            const processed = processData(parsed);
            setData(processed);
            await supabase.from('bookmarks_user_data').insert({
              user_id: user.id,
              payload: processed,
              updated_at: new Date().toISOString()
            });
          }
        }
      } catch (e) {
        console.error('Error loading cloud data:', e);
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

  const FOLDER_COLORS = [
    'text-blue-500', 'text-emerald-500', 'text-rose-500', 
    'text-amber-500', 'text-indigo-500', 'text-violet-500',
    'text-cyan-500', 'text-orange-500'
  ];

  const addFolder = (name, parentId = null) => {
    const parentFolder = data.folders.find(f => f.id === parentId);
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

  const getBookmarkCount = (folderId) => {
    const childFolders = data.folders.filter(f => f.parentId === folderId);
    const subCount = childFolders.reduce((sum, f) => sum + getBookmarkCount(f.id), 0);
    const directCount = data.bookmarks.filter(b => b.folderId === folderId).length;
    return directCount + subCount;
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
    folders: data.folders.filter(f => f.type === data.activeContext),
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
    getBookmarkCount,
    activeFilter,
    setActiveFilter,
    popularBookmarks,
    searchQuery,
    setSearchQuery,
    isSyncing,
    importData: (newData) => saveChanges(newData),
    exportData: () => JSON.stringify(data, null, 2),
    bulkImport: async (importedFolders, importedBookmarks) => {
      const newData = {
        ...data,
        folders: [...data.folders, ...importedFolders],
        bookmarks: [...data.bookmarks, ...importedBookmarks]
      };
      await saveChanges(newData);
    }
  };
}

