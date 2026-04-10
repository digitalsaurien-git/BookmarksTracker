import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabase';

const STORAGE_KEY = 'bookmarks_tracker_data';

const DEFAULT_DATA = {
  activeContext: 'perso', // 'perso' or 'pro'
  folders: [
    { id: 'root-perso', name: 'Favoris Perso', parentId: null, type: 'perso', isExpanded: true },
    { id: 'root-pro', name: 'Favoris Pro', parentId: null, type: 'pro', isExpanded: true }
  ],
  bookmarks: []
};

export function useBookmarks(user) {
  const [data, setData] = useState(DEFAULT_DATA);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  // Load data
  useEffect(() => {
    if (!user) {
      // Offline mode? Use local storage
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setData(JSON.parse(saved));
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

        if (error && error.code !== 'PGRST116') { // PGRST116 is 'no rows found'
          throw error;
        }

        if (cloudData?.payload) {
          setData(cloudData.payload);
        } else {
          // New user or no cloud data: Migration from localStorage
          const localSaved = localStorage.getItem(STORAGE_KEY);
          if (localSaved) {
            const parsed = JSON.parse(localSaved);
            setData(parsed);
            // Push to cloud immediately
            await supabase.from('bookmarks_user_data').insert({
              user_id: user.id,
              payload: parsed,
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

  const addFolder = (name, parentId = null) => {
    const parentFolder = data.folders.find(f => f.id === parentId);
    const newFolder = {
      id: 'folder-' + Date.now().toString(),
      name,
      parentId,
      type: parentFolder ? parentFolder.type : data.activeContext,
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

  const addBookmark = (bookmark) => {
    const newBookmark = {
      id: 'bookmark-' + Date.now().toString(),
      ...bookmark,
      type: data.activeContext,
      tags: typeof bookmark.tags === 'string' ? bookmark.tags.split(',').map(t => t.trim()).filter(Boolean) : bookmark.tags,
      description: bookmark.description || '',
      faviconUrl: bookmark.faviconUrl || '',
      isPrivate: !!bookmark.isPrivate,
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

  const getBookmarkCount = (folderId) => {
    const childFolders = data.folders.filter(f => f.parentId === folderId);
    const subCount = childFolders.reduce((sum, f) => sum + getBookmarkCount(f.id), 0);
    const directCount = data.bookmarks.filter(b => b.folderId === folderId).length;
    return directCount + subCount;
  };

  const filteredBookmarks = data.bookmarks.filter(b => {
    const contextMatch = b.type === data.activeContext;
    const query = searchQuery.toLowerCase();
    const searchMatch = !query || b.title.toLowerCase().includes(query) || 
                       b.url.toLowerCase().includes(query) ||
                       b.tags.some(t => t.toLowerCase().includes(query));
    return contextMatch && searchMatch;
  });

  return {
    data,
    activeContext: data.activeContext,
    setContext,
    folders: data.folders,
    bookmarks: filteredBookmarks,
    addFolder,
    deleteFolder,
    toggleFolderExpand,
    addBookmark,
    deleteBookmark,
    moveBookmark,
    getBookmarkCount,
    searchQuery,
    setSearchQuery,
    isSyncing,
    importData: (newData) => saveChanges(newData),
    exportData: () => JSON.stringify(data, null, 2),
    bulkImport: async (importedFolders, importedBookmarks) => {
      // Merge imported data with existing root folders if necessary
      // But user said they have nothing, so we can potentially replace if empty
      const newData = {
        ...data,
        folders: [...data.folders, ...importedFolders],
        bookmarks: [...data.bookmarks, ...importedBookmarks]
      };
      await saveChanges(newData);
    }
  };
}

