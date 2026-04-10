import { useState, useEffect } from 'react';

const STORAGE_KEY = 'bookmarks_tracker_data';

const DEFAULT_DATA = {
  activeContext: 'perso', // 'perso' or 'pro'
  folders: [
    { id: 'root-perso', name: 'Général', parentId: null, type: 'perso' },
    { id: 'root-pro', name: 'Général', parentId: null, type: 'pro' }
  ],
  bookmarks: []
};

export function useBookmarks() {
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : DEFAULT_DATA;
  });

  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const activeContext = data.activeContext;
  
  const setContext = (context) => {
    setData(prev => ({ ...prev, activeContext: context }));
  };

  const addFolder = (name, parentId = null) => {
    const newFolder = {
      id: Date.now().toString(),
      name,
      parentId,
      type: activeContext
    };
    setData(prev => ({
      ...prev,
      folders: [...prev.folders, newFolder]
    }));
  };

  const deleteFolder = (folderId) => {
    setData(prev => ({
      ...prev,
      folders: prev.folders.filter(f => f.id !== folderId),
      bookmarks: prev.bookmarks.filter(b => b.folderId !== folderId)
    }));
  };

  const addBookmark = (bookmark) => {
    const newBookmark = {
      id: Date.now().toString(),
      ...bookmark,
      type: activeContext,
      tags: typeof bookmark.tags === 'string' ? bookmark.tags.split(',').map(t => t.trim()).filter(Boolean) : bookmark.tags
    };
    setData(prev => ({
      ...prev,
      bookmarks: [...prev.bookmarks, newBookmark]
    }));
  };

  const deleteBookmark = (id) => {
    setData(prev => ({
      ...prev,
      bookmarks: prev.bookmarks.filter(b => b.id !== id)
    }));
  };

  const updateBookmark = (id, updates) => {
    setData(prev => ({
      ...prev,
      bookmarks: prev.bookmarks.map(b => b.id === id ? { ...b, ...updates } : b)
    }));
  };

  const moveBookmark = (id, newFolderId) => {
    updateBookmark(id, { folderId: newFolderId });
  };

  const importData = (newData) => {
    try {
      setData(newData);
      return true;
    } catch (e) {
      console.error('Import failed', e);
      return false;
    }
  };

  const filteredFolders = data.folders.filter(f => f.type === activeContext);
  
  const allContextBookmarks = data.bookmarks.filter(b => b.type === activeContext);
  
  const filteredBookmarks = allContextBookmarks.filter(b => {
    const query = searchQuery.toLowerCase();
    return b.title.toLowerCase().includes(query) || 
           b.url.toLowerCase().includes(query) ||
           b.tags.some(t => t.toLowerCase().includes(query));
  });

  return {
    data,
    activeContext,
    setContext,
    folders: filteredFolders,
    bookmarks: filteredBookmarks,
    addFolder,
    deleteFolder,
    addBookmark,
    deleteBookmark,
    moveBookmark,
    searchQuery,
    setSearchQuery,
    importData,
    exportData: () => JSON.stringify(data, null, 2)
  };
}
