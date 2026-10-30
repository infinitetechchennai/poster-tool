import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Cpu,
  CheckCircle2,
  AlertCircle,
  Database,
  Download,
  Upload,
  Trash2,
  Save,
  HelpCircle,
  Info,
  RefreshCw,
  Zap,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { ollamaService } from '../services/ollamaService';
import { storageService, DEFAULT_SETTINGS } from '../services/storageService';
import { pollinationsService, POLLINATIONS_MODELS } from '../services/pollinationsService';

export default function Settings({
  appSettings,
  setAppSettings,
  onShowToast,
  onStorageCleared
}) {
  const [formData, setFormData] = useState({
    ...DEFAULT_SETTINGS,
    ...appSettings,
    pollinationsApiKey: pollinationsService.getApiKey(),
    pollinationsModel: pollinationsService.getPreferredModel()
  });
  const [isTestingOllama, setIsTestingOllama] = useState(false);
  const [ollamaStatus, setOllamaStatus] = useState(null); // { success: bool, message: string, models: [] }

  const handleTestOllama = async () => {
    setIsTestingOllama(true);
    setOllamaStatus(null);
    try {
      const res = await ollamaService.testConnection(formData.ollamaUrl);
      if (res.success) {
        setOllamaStatus({
          success: true,
          message: `Connected successfully! Found ${res.models?.length || 0} models.`,
          models: res.models || []
        });
        onShowToast?.({ type: 'success', message: 'Ollama is online and connected!' });
      } else {
        setOllamaStatus({
          success: false,
          message: res.error || 'Connection failed'
        });
        onShowToast?.({ type: 'error', message: 'Could not connect to Ollama.' });
      }
    } catch (e) {
      setOllamaStatus({
        success: false,
        message: 'Network error or CORS issue. Ensure Ollama is running.'
      });
    } finally {
      setIsTestingOllama(false);
    }
  };

  const handleSaveSettings = () => {
    pollinationsService.setApiKey(formData.pollinationsApiKey);
    pollinationsService.setPreferredModel(formData.pollinationsModel);
    const ok = storageService.saveAppSettings(formData);
    if (ok) {
      setAppSettings(formData);
      onShowToast?.({ type: 'success', message: 'Settings saved successfully!' });
    } else {
      onShowToast?.({ type: 'error', message: 'Failed to save settings.' });
    }
  };

  const handleExportBackup = () => {
    const data = storageService.exportAllData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `postcraft-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onShowToast?.({ type: 'success', message: 'Backup file downloaded!' });
  };

  const handleImportBackup = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        const ok = storageService.importAllData(parsed);
        if (ok) {
          onShowToast?.({ type: 'success', message: 'Data restored successfully! Refreshing view...' });
          setTimeout(() => window.location.reload(), 1000);
        } else {
          onShowToast?.({ type: 'error', message: 'Failed to restore data.' });
        }
      } catch (err) {
        onShowToast?.({ type: 'error', message: 'Invalid JSON backup file.' });
      }
    };
    reader.readAsText(file);
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to delete ALL saved posts and custom brand settings? This cannot be undone.')) {
      storageService.clearAllData();
      onStorageCleared?.();
      onShowToast?.({ type: 'info', message: 'All local data cleared.' });
      setTimeout(() => window.location.reload(), 800);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl pb-12">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <SettingsIcon className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-display font-bold text-slate-900">Application Settings</h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Configure optional local AI integration, manage browser storage, and backup your data.
            </p>
          </div>

          <button
            type="button"
            onClick={handleSaveSettings}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-display font-semibold text-xs transition-all shadow-md shadow-blue-500/20 active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>Save Settings</span>
          </button>
        </div>

        {/* Section 1: Ollama Local AI */}
        <div className="pt-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                <Cpu className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Ollama Local AI (Optional)</h3>
                <p className="text-xs text-slate-500">Run local LLMs on your machine for zero-cost AI post generation.</p>
              </div>
            </div>

            {/* Toggle Switch */}
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.ollamaEnabled}
                onChange={(e) => setFormData(prev => ({ ...prev, ollamaEnabled: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>

          {formData.ollamaEnabled ? (
            <div className="p-4 rounded-xl bg-purple-50/50 border border-purple-100 space-y-4 animate-in fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Ollama Server URL
                  </label>
                  <input
                    type="text"
                    value={formData.ollamaUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, ollamaUrl: e.target.value }))}
                    placeholder="http://localhost:11434"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Model Name
                  </label>
                  <input
                    type="text"
                    value={formData.ollamaModel}
                    onChange={(e) => setFormData(prev => ({ ...prev, ollamaModel: e.target.value }))}
                    placeholder="llama3, mistral, or phi3"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
                  />
                </div>
              </div>

              {/* Test Button & Status */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleTestOllama}
                  disabled={isTestingOllama}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-purple-200 hover:bg-purple-100/50 text-purple-700 font-semibold text-xs transition-colors shadow-sm"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isTestingOllama ? 'animate-spin' : ''}`} />
                  <span>{isTestingOllama ? 'Testing...' : 'Test Connection'}</span>
                </button>

                {ollamaStatus && (
                  <div className={`flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-lg ${
                    ollamaStatus.success ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {ollamaStatus.success ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> : <AlertCircle className="w-3.5 h-3.5 shrink-0" />}
                    <span>{ollamaStatus.message}</span>
                  </div>
                )}
              </div>

              {ollamaStatus?.models && ollamaStatus.models.length > 0 && (
                <div className="pt-2 text-xs text-purple-900">
                  <span className="font-semibold">Installed Models on your machine: </span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {ollamaStatus.models.map(m => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, ollamaModel: m }))}
                        className="px-2 py-0.5 rounded bg-white border border-purple-200 font-mono text-[11px] text-purple-700 hover:bg-purple-100"
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-500 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500 shrink-0" />
              <span>
                Using built-in high-performance template generator. 100% free, runs instantly in your browser without requiring any software installation.
              </span>
            </div>
          )}
        </div>

        {/* Section 2: Pollinations AI & Image Generation Settings */}
        <div className="pt-8 mt-8 border-t border-slate-100 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Pollinations AI Image Generation</h3>
              <p className="text-xs text-slate-500">
                Configure preferred image diffusion model and optional API key for high-fidelity photorealism.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Preferred Image Model
                </label>
                <select
                  value={formData.pollinationsModel || 'flux'}
                  onChange={(e) => setFormData(prev => ({ ...prev, pollinationsModel: e.target.value }))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-600"
                >
                  {POLLINATIONS_MODELS.map(m => (
                    <option key={m.id} value={m.id}>{m.label}</option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500 mt-1">
                  FLUX.1 Schnell provides state-of-the-art text understanding, photorealism, and accurate cultural elements.
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase">
                    Pollinations API Key (Optional)
                  </label>
                  <a
                    href="https://enter.pollinations.ai"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-cyan-600 hover:text-cyan-700 font-semibold flex items-center gap-0.5 hover:underline"
                  >
                    <span>Get Free Key</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <input
                  type="password"
                  value={formData.pollinationsApiKey || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, pollinationsApiKey: e.target.value }))}
                  placeholder="Enter your key from enter.pollinations.ai"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-600"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Unlocks unmetered FLUX generation and bypasses public anonymous queue throttling.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Data Management */}
        <div className="pt-8 mt-8 border-t border-slate-100 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Local Data & Backup</h3>
              <p className="text-xs text-slate-500">Your posts and brand profiles are stored exclusively in your local browser storage.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <button
              type="button"
              onClick={handleExportBackup}
              className="flex items-center justify-center gap-2 p-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
            >
              <Download className="w-4 h-4 text-blue-600" />
              <span>Export All Data (JSON)</span>
            </button>

            <label className="flex items-center justify-center gap-2 p-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer transition-colors">
              <Upload className="w-4 h-4 text-purple-600" />
              <span>Import Data (JSON)</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportBackup}
                className="hidden"
              />
            </label>

            <button
              type="button"
              onClick={handleClearAll}
              className="flex items-center justify-center gap-2 p-3.5 rounded-xl border border-rose-200 hover:bg-rose-50 text-rose-600 text-xs font-semibold transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear All Data</span>
            </button>
          </div>
        </div>

        {/* Section 3: Architecture Guarantee */}
        <div className="pt-8 mt-8 border-t border-slate-100">
          <div className="p-4 rounded-xl bg-slate-900 text-slate-300 text-xs space-y-2">
            <p className="font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>PostCraft AI — Client-Side Guarantee</span>
            </p>
            <p className="leading-relaxed">
              PostCraft AI renders all images directly on your device via HTML5 Canvas vector math. There are no paid API subscriptions, no monthly credits, and no server lock-in. Your data remains entirely private on your device.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
