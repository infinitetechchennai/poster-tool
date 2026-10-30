import React, { useState, useEffect } from 'react';
import BrandSettingsForm from '../components/BrandSettingsForm';
import { storageService, DEFAULT_BRAND } from '../services/storageService';

export default function BrandSettings({ brand, setBrand, onShowToast }) {
  const [formData, setFormData] = useState({ ...brand });

  useEffect(() => {
    setFormData({ ...brand });
  }, [brand]);

  const handleBrandChange = (updater) => {
    setFormData(prev => {
      const updated = typeof updater === 'function' ? updater(prev) : updater;
      // Auto-save and live sync to App-level brand state immediately
      storageService.saveBrandSettings(updated);
      setBrand(updated);
      return updated;
    });
  };

  const handleSave = () => {
    const ok = storageService.saveBrandSettings(formData);
    if (ok) {
      setBrand(formData);
      onShowToast?.({ type: 'success', message: 'Brand identity and design presets saved!' });
    } else {
      onShowToast?.({ type: 'error', message: 'Failed to save brand settings.' });
    }
  };

  const handleReset = () => {
    if (window.confirm('Reset all brand settings to default?')) {
      storageService.saveBrandSettings(DEFAULT_BRAND);
      setFormData(DEFAULT_BRAND);
      setBrand(DEFAULT_BRAND);
      onShowToast?.({ type: 'info', message: 'Brand presets reset to default.' });
    }
  };

  return (
    <div className="pb-12">
      <BrandSettingsForm
        brand={formData}
        setBrand={handleBrandChange}
        onSave={handleSave}
        onReset={handleReset}
        onShowToast={onShowToast}
      />
    </div>
  );
}
