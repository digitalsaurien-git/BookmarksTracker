import { useState, useEffect } from 'react';

const STORAGE_KEY = 'bookmarks_tracker_data';

const DEFAULT_DATA = {
  activeContext: 'perso', // 'perso' or 'pro'
  folders: [
    { id: 'root-perso', name: 'Favoris Perso', parentId: null, type: 'perso', isExpanded: true },
    { id: 'root-pro', name: 'Favoris Pro', parentId: null, type: 'pro', isExpanded: true }
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
    const parentFolder = data.folders.find(f => f.id === parentId);
    const newFolder = {
      id: 'folder-' + Date.now().toString(),
      name,
      parentId,
      type: parentFolder ? parentFolder.type : activeContext,
      isExpanded: true
    };
    setData(prev => ({
      ...prev,
      folders: [...prev.folders, newFolder]
    }));
  };

  const toggleFolderExpand = (folderId) => {
    setData(prev => ({
      ...prev,
      folders: prev.folders.map(f => f.id === folderId ? { ...f, isExpanded: !f.isExpanded } : f)
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
      id: 'bookmark-' + Date.now().toString(),
      ...bookmark,
      type: activeContext,
      tags: typeof bookmark.tags === 'string' ? bookmark.tags.split(',').map(t => t.trim()).filter(Boolean) : bookmark.tags,
      description: bookmark.description || '',
      faviconUrl: bookmark.faviconUrl || '',
      isPrivate: !!bookmark.isPrivate,
      createdAt: new Date().toISOString()
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

  const getBookmarkCount = (folderId) => {
    // Count bookmarks in this folder and ALL subfolders
    const childFolders = data.folders.filter(f => f.parentId === folderId);
    const subCount = childFolders.reduce((sum, f) => sum + getBookmarkCount(f.id), 0);
    const directCount = data.bookmarks.filter(b => b.folderId === folderId).length;
    return directCount + subCount;
  };

  return {
    data,
    activeContext,
    setContext,
    folders: data.folders, // Sidebar handles filtering
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
    importData,
    exportData: () => JSON.stringify(data, null, 2)
  };
}

