import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Toast from './components/Toast';
import CreatePost from './pages/CreatePost';
import BulkGenerator from './pages/BulkGenerator';
import AutoPosting from './pages/AutoPosting';
import MyPosts from './pages/MyPosts';
import BrandSettings from './pages/BrandSettings';
import Settings from './pages/Settings';
import ErrorBoundary from './components/ErrorBoundary';
import { storageService, DEFAULT_BRAND, DEFAULT_SETTINGS } from './services/storageService';

export default function App() {
  const [activeTab, setActiveTab] = useState('create');
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [brand, setBrand] = useState(DEFAULT_BRAND);
  const [appSettings, setAppSettings] = useState(DEFAULT_SETTINGS);
  const [savedPostsCount, setSavedPostsCount] = useState(0);
  const [toast, setToast] = useState(null);

  // Cross-page state transfers
  const [postToEdit, setPostToEdit] = useState(null);
  const [bulkSeedText, setBulkSeedText] = useState('');
  const [libraryRefreshTrigger, setLibraryRefreshTrigger] = useState(0);

  // Load initial brand and app settings from local storage
  useEffect(() => {
    const loadedBrand = storageService.getBrandSettings();
    const loadedSettings = storageService.getAppSettings();
    const posts = storageService.getSavedPosts();
    
    setBrand(loadedBrand);
    setAppSettings(loadedSettings);
    setSavedPostsCount(posts.length);
  }, []);

  const refreshSavedCount = () => {
    const posts = storageService.getSavedPosts();
    setSavedPostsCount(posts.length);
    setLibraryRefreshTrigger(prev => prev + 1);
  };

  const handleShowToast = (toastObj) => {
    setToast(toastObj);
    refreshSavedCount();
  };

  // Switch to CreatePost with a specific post to edit
  const handleReopenInEditor = (post) => {
    setPostToEdit(post);
    setActiveTab('create');
  };

  // Switch from Single to Bulk with seeded text
  const handleNavigateToBulk = (seedText) => {
    setBulkSeedText(seedText);
    setActiveTab('bulk');
  };

  // Tab Titles
  const tabTitles = {
    create: 'Create Post',
    bulk: 'Bulk Generator',
    autopost: 'Social Accounts & Auto-Posting',
    posts: 'My Posts',
    brand: 'Brand Settings',
    settings: 'Settings'
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Toast Notification */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab === 'create') setPostToEdit(null);
          setActiveTab(tab);
        }}
        brand={brand}
        savedPostsCount={savedPostsCount}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* Main Content Area */}
      <div className="lg:pl-72 flex-1 flex flex-col min-w-0">
        <Header
          onMenuClick={() => setIsMobileOpen(true)}
          currentTabTitle={tabTitles[activeTab]}
          brand={brand}
          isOllamaEnabled={appSettings.ollamaEnabled}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <ErrorBoundary>
            {activeTab === 'create' && (
              <CreatePost
                brand={brand}
                appSettings={appSettings}
                onShowToast={handleShowToast}
                onNavigateToBulk={handleNavigateToBulk}
                initialPostToEdit={postToEdit}
              />
            )}

            {activeTab === 'bulk' && (
              <BulkGenerator
                brand={brand}
                appSettings={appSettings}
                onShowToast={handleShowToast}
                onOpenInEditor={handleReopenInEditor}
                initialBulkText={bulkSeedText}
              />
            )}

            {activeTab === 'autopost' && (
              <AutoPosting
                brand={brand}
                onShowToast={handleShowToast}
              />
            )}

            {activeTab === 'posts' && (
              <MyPosts
                onReopenPost={handleReopenInEditor}
                onNavigateToCreate={() => {
                  setPostToEdit(null);
                  setActiveTab('create');
                }}
                onShowToast={handleShowToast}
                refreshTrigger={libraryRefreshTrigger}
              />
            )}

            {activeTab === 'brand' && (
              <BrandSettings
                brand={brand}
                setBrand={setBrand}
                onShowToast={handleShowToast}
              />
            )}

            {activeTab === 'settings' && (
              <Settings
                appSettings={appSettings}
                setAppSettings={setAppSettings}
                onShowToast={handleShowToast}
                onStorageCleared={() => {
                  setBrand(DEFAULT_BRAND);
                  setAppSettings(DEFAULT_SETTINGS);
                  setSavedPostsCount(0);
                }}
              />
            )}
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}
