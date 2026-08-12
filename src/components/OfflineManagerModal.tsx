import React, { useState } from 'react';
import {
  Wifi,
  WifiOff,
  Database,
  RefreshCw,
  Download,
  Upload,
  X,
  CheckCircle,
  HardDrive
} from 'lucide-react';
import { storageService } from '../services/storage';

interface OfflineManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSyncCompleted: () => void;
}

export const OfflineManagerModal: React.FC<OfflineManagerModalProps> = ({
  isOpen,
  onClose,
  onSyncCompleted
}) => {
  if (!isOpen) return null;

  const status = storageService.getOfflineStatus();
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccessMsg, setSyncSuccessMsg] = useState<string | null>(null);

  const handleManualSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      const count = storageService.syncPendingData();
      setIsSyncing(false);
      setSyncSuccessMsg(`${count} modification(s) synchronisée(s) avec succès dans la base de données.`);
      onSyncCompleted();
    }, 1200);
  };

  const handleExportBackup = () => {
    const jsonStr = storageService.exportBackupJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_qaloon_teacher_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (storageService.importBackupJSON(content)) {
        alert('Sauvegarde restaurée avec succès!');
        onSyncCompleted();
        onClose();
      } else {
        alert('Format de sauvegarde invalide.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 text-slate-400 hover:text-slate-200"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-6 border-b border-slate-800 pb-4">
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100">
              Mode Hors Ligne & Moteur SQLite Local
            </h3>
            <p className="text-xs text-slate-400">
              Garantit l'accès et la sauvegarde des données dans les zones sans connexion
            </p>
          </div>
        </div>

        <div className="space-y-4 text-xs">
          {/* Status Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">État du Réseau</span>
              <div className="flex items-center space-x-2 mt-1">
                {status.isOfflineMode ? (
                  <>
                    <WifiOff className="w-4 h-4 text-amber-400" />
                    <span className="font-bold text-amber-300">Hors Ligne Actif</span>
                  </>
                ) : (
                  <>
                    <Wifi className="w-4 h-4 text-emerald-400" />
                    <span className="font-bold text-emerald-300">Connecté</span>
                  </>
                )}
              </div>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">File de Synchro</span>
              <div className="flex items-center space-x-2 mt-1">
                <HardDrive className="w-4 h-4 text-amber-400" />
                <span className="font-bold text-slate-200">{status.pendingSyncCount} action(s) en attente</span>
              </div>
            </div>
          </div>

          {/* Offline Toggle Option */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-200 block">Simuler Mode Hors Ligne</span>
              <span className="text-[10px] text-slate-400">Force la sauvegarde 100% locale dans SQLite IndexedDB</span>
            </div>

            <button
              onClick={() => {
                storageService.setOfflineModeOverride(!status.isOfflineMode);
                onSyncCompleted();
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                status.isOfflineMode
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {status.isOfflineMode ? 'Actif' : 'Désactivé'}
            </button>
          </div>

          {/* Sync Button */}
          <button
            onClick={handleManualSync}
            disabled={isSyncing}
            className="w-full flex items-center justify-center space-x-2 p-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold transition-all disabled:opacity-50 shadow-lg"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Synchronisation en cours...' : 'Synchroniser avec le serveur'}</span>
          </button>

          {syncSuccessMsg && (
            <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-emerald-300 flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{syncSuccessMsg}</span>
            </div>
          )}

          {/* Export & Import Backup */}
          <div className="pt-2 border-t border-slate-800 flex space-x-2">
            <button
              onClick={handleExportBackup}
              className="flex-1 flex items-center justify-center space-x-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-200 font-semibold"
            >
              <Download className="w-4 h-4 text-amber-400" />
              <span>Exporter Backup JSON</span>
            </button>

            <label className="flex-1 flex items-center justify-center space-x-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-200 font-semibold cursor-pointer">
              <Upload className="w-4 h-4 text-amber-400" />
              <span>Importer Backup</span>
              <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
