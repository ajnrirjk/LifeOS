import React, { useState } from 'react';
import { JournalEntry, EncryptedBackupPayload } from '../../types/journal';
import { encryptionService } from '../../services/encryptionService';
import { 
  ShieldCheck, 
  Lock, 
  CloudUpload, 
  CloudDownload, 
  Download, 
  Upload, 
  X, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle,
  KeyRound,
  RefreshCw
} from 'lucide-react';
import { sounds } from '../../services/soundEffects';

interface EncryptedBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  entries: JournalEntry[];
  onRestoreEntries: (entries: JournalEntry[]) => void;
}

export const EncryptedBackupModal: React.FC<EncryptedBackupModalProps> = ({
  isOpen,
  onClose,
  entries,
  onRestoreEntries,
}) => {
  const [passphrase, setPassphrase] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [vaultId, setVaultId] = useState('user_vault_primary');
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

  if (!isOpen) return null;

  // Cloud Sync: Upload Encrypted
  const handleCloudUpload = async () => {
    if (!passphrase.trim()) {
      setStatusMessage({ type: 'error', text: 'Please enter a secret passphrase to encrypt your backup.' });
      sounds.playIncorrect();
      return;
    }
    sounds.playTap();
    setIsLoading(true);
    setStatusMessage(null);

    try {
      // 1. Client-side zero-knowledge encryption
      const encrypted = await encryptionService.encryptJournal(entries, passphrase);

      // 2. Upload to cloud backup endpoint
      const res = await fetch('/api/journal/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vaultId,
          encryptedPayload: JSON.stringify(encrypted),
        }),
      });

      if (!res.ok) {
        throw new Error('Server failed to store backup');
      }

      const data = await res.json();
      setLastSyncTime(new Date(data.lastModified).toLocaleTimeString());
      setStatusMessage({
        type: 'success',
        text: `Successfully encrypted and synced ${entries.length} entries to cloud vault!`,
      });
      sounds.playVictory();
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Encryption/Cloud sync failed.' });
      sounds.playIncorrect();
    } finally {
      setIsLoading(false);
    }
  };

  // Cloud Sync: Restore Encrypted
  const handleCloudRestore = async () => {
    if (!passphrase.trim()) {
      setStatusMessage({ type: 'error', text: 'Enter your passphrase to decrypt the cloud backup.' });
      sounds.playIncorrect();
      return;
    }
    sounds.playTap();
    setIsLoading(true);
    setStatusMessage(null);

    try {
      const res = await fetch(`/api/journal/backup?vaultId=${encodeURIComponent(vaultId)}`);
      if (!res.ok) {
        throw new Error('No cloud backup found for this vault ID. Sync one first!');
      }

      const data = await res.json();
      const payload: EncryptedBackupPayload = JSON.parse(data.encryptedPayload);

      // Client-side zero-knowledge decryption
      const restored = await encryptionService.decryptJournal(payload, passphrase);
      onRestoreEntries(restored);
      setStatusMessage({
        type: 'success',
        text: `Successfully decrypted and restored ${restored.length} entries from cloud!`,
      });
      sounds.playVictory();
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to decrypt cloud backup.' });
      sounds.playIncorrect();
    } finally {
      setIsLoading(false);
    }
  };

  // Export encrypted file (.biblejournal.enc)
  const handleExportFile = async () => {
    if (!passphrase.trim()) {
      setStatusMessage({ type: 'error', text: 'Enter a passphrase to protect your exported backup.' });
      sounds.playIncorrect();
      return;
    }
    sounds.playTap();
    setIsLoading(true);

    try {
      const encrypted = await encryptionService.encryptJournal(entries, passphrase);
      const blob = new Blob([JSON.stringify(encrypted, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `BibleJournal_Backup_${new Date().toISOString().slice(0, 10)}.biblejournal.enc`;
      a.click();
      URL.revokeObjectURL(url);

      setStatusMessage({
        type: 'success',
        text: `Exported encrypted file (.biblejournal.enc) with ${entries.length} entries.`,
      });
      sounds.playVictory();
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Export failed.' });
      sounds.playIncorrect();
    } finally {
      setIsLoading(false);
    }
  };

  // Import encrypted file (.biblejournal.enc)
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!passphrase.trim()) {
      setStatusMessage({ type: 'error', text: 'Enter your passphrase first, then select the file.' });
      sounds.playIncorrect();
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        setIsLoading(true);
        const content = event.target?.result as string;
        const payload: EncryptedBackupPayload = JSON.parse(content);
        const restored = await encryptionService.decryptJournal(payload, passphrase);
        onRestoreEntries(restored);
        setStatusMessage({
          type: 'success',
          text: `Decrypted and imported ${restored.length} entries from file!`,
        });
        sounds.playVictory();
      } catch (err: any) {
        setStatusMessage({ type: 'error', text: err.message || 'Failed to decrypt imported file.' });
        sounds.playIncorrect();
      } finally {
        setIsLoading(false);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border-2 border-stone-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl flex flex-col gap-5 text-stone-900 dark:text-stone-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-lg">Encrypted Cloud Vault</h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                AES-256-GCM zero-knowledge encryption & synchronization
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              sounds.playTap();
              onClose();
            }}
            className="p-1.5 rounded-full hover:bg-stone-100 dark:hover:bg-slate-800 text-stone-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Security Notice */}
        <div className="p-3.5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5 leading-relaxed">
          <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong>End-to-End Privacy:</strong> Your verses, sacred reflections, prayers, and photo attachments are encrypted in your browser using PBKDF2 and AES-256 before upload. No one—not even the server—can read your notes without your secret passphrase.
          </div>
        </div>

        {/* Passphrase Input */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-black uppercase tracking-wider text-stone-500 dark:text-stone-400 flex items-center justify-between">
            <span>Encryption Passphrase</span>
            <span className="text-[10px] lowercase font-normal opacity-75">Used to lock & unlock vault</span>
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={passphrase}
              onChange={(e) => setPassphrase(e.target.value)}
              placeholder="Enter your secret passphrase..."
              className="w-full px-4 py-2.5 pr-10 rounded-2xl bg-stone-50 dark:bg-slate-800 border-2 border-stone-200 dark:border-slate-700 text-sm font-semibold focus:outline-none focus:border-emerald-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Status Message */}
        {statusMessage && (
          <div
            className={`p-3 rounded-2xl text-xs flex items-center gap-2 font-bold ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                : 'bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Cloud Actions */}
        <div className="flex flex-col gap-2.5">
          <span className="text-xs font-black uppercase tracking-wider text-stone-400">
            Cross-Device Cloud Sync
          </span>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={handleCloudUpload}
              disabled={isLoading || entries.length === 0}
              className="py-3 px-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md disabled:opacity-50 transition-all"
            >
              <CloudUpload className="w-4 h-4" />
              <span>{isLoading ? 'Encrypting...' : 'Sync to Cloud Vault'}</span>
            </button>

            <button
              onClick={handleCloudRestore}
              disabled={isLoading}
              className="py-3 px-3 rounded-2xl bg-stone-100 hover:bg-stone-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-stone-800 dark:text-stone-200 font-extrabold text-xs flex items-center justify-center gap-1.5 border border-stone-200 dark:border-slate-700 disabled:opacity-50 transition-all"
            >
              <CloudDownload className="w-4 h-4 text-emerald-500" />
              <span>Restore from Cloud</span>
            </button>
          </div>
          {lastSyncTime && (
            <span className="text-[11px] text-stone-400 text-center font-medium">
              Last synced at {lastSyncTime}
            </span>
          )}
        </div>

        {/* Local File Backup Actions */}
        <div className="flex flex-col gap-2.5 pt-2 border-t border-stone-200 dark:border-slate-800">
          <span className="text-xs font-black uppercase tracking-wider text-stone-400">
            Local Encrypted Backup File
          </span>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={handleExportFile}
              disabled={isLoading || entries.length === 0}
              className="py-2.5 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-slate-800 dark:hover:bg-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 text-stone-700 dark:text-stone-300 disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export .enc File</span>
            </button>

            <label className="py-2.5 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-slate-800 dark:hover:bg-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 text-stone-700 dark:text-stone-300 cursor-pointer text-center">
              <Upload className="w-3.5 h-3.5" />
              <span>Import .enc File</span>
              <input
                type="file"
                accept=".enc,.json"
                onChange={handleImportFile}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
