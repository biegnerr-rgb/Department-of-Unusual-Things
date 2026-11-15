import React, { useState } from 'react';
import {
  Download,
  History,
  Home,
  Pause,
  Play,
  RotateCcw,
  Save,
  Upload,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { GameSettings } from '../types/game';

interface SettingsModalProps {
  open: boolean;
  settings: GameSettings;
  lastSavedAt: number;
  backupTimestamp: number | null;
  onClose: () => void;
  onUpdateSettings: (partial: Partial<GameSettings>) => void;
  onManualSave: () => boolean;
  onRestoreBackup: () => boolean;
  onExportSave: () => string;
  onImportSave: (rawJson: string) => boolean;
  onResetGame: () => void;
  onReplayTutorial?: () => void;
  onReturnTitle: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  open,
  settings,
  lastSavedAt,
  backupTimestamp,
  onClose,
  onUpdateSettings,
  onManualSave,
  onRestoreBackup,
  onExportSave,
  onImportSave,
  onResetGame,
  onReplayTutorial,
  onReturnTitle,
}) => {
  const [confirmReset, setConfirmReset] = useState(false);
  const [importText, setImportText] = useState('');
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  if (!open) return null;

  const handleCopySave = () => {
    const json = onExportSave();
    navigator.clipboard?.writeText(json).catch(() => {});
    setImportText(json);
    setStatusMsg('Save data exported into box below (and copied if permitted).');
  };

  const handleLoadSave = () => {
    const ok = onImportSave(importText);
    setStatusMsg(ok ? 'Save data restored successfully!' : 'Invalid save JSON format.');
  };

  const handleRestoreAutoBackup = () => {
    const ok = onRestoreBackup();
    setStatusMsg(
      ok
        ? 'Rolling auto-backup snapshot restored cleanly!'
        : 'No previous rolling backup snapshot available yet.'
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#26211C]/45"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg max-h-[88dvh] bg-[#FAF5EB] border-2 border-[#2D241E] rounded-2xl shadow-[0_8px_0_#2D241E] flex flex-col overflow-hidden animate-modal-pop"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 bg-[#FFFDF8] border-b-2 border-[#2D241E] flex items-center justify-between">
          <div>
            <h2 className="font-display text-xl font-bold text-[#26211C]">Department Settings</h2>
            <p className="text-xs font-mono-num text-[#6B5E51]">
              Last saved: {new Date(lastSavedAt).toLocaleTimeString()}
              {backupTimestamp
                ? ` · Backup: ${new Date(backupTimestamp).toLocaleTimeString()}`
                : ''}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close settings"
            className="w-10 h-10 rounded-lg border-2 border-[#2D241E] bg-[#FFFDF8] hover:bg-[#EFE6D5] flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto warm-scroll p-4 sm:p-5 space-y-4">
          {/* Audio & Simulation Controls */}
          <div className="rounded-xl border-2 border-[#2D241E] bg-[#FFFDF8] p-4 space-y-3">
            <h3 className="font-display text-sm font-bold text-[#26211C]">
              Audio & Simulation
            </h3>

            <div className="flex items-center justify-between gap-3">
              <span className="text-sm text-[#3F362D]">Sound Effects</span>
              <button
                type="button"
                onClick={() => onUpdateSettings({ soundEnabled: !settings.soundEnabled })}
                className={`min-h-[40px] inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 border-[#2D241E] text-xs font-semibold cursor-pointer ${
                  settings.soundEnabled
                    ? 'bg-[#0D9488] text-white'
                    : 'bg-[#E5DDD0] text-[#4B4035]'
                }`}
              >
                {settings.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                <span>{settings.soundEnabled ? 'Enabled' : 'Muted'}</span>
              </button>
            </div>

            <div className="flex items-center justify-between gap-3">
              <span className="text-sm text-[#3F362D]">Simulation Pause</span>
              <button
                type="button"
                onClick={() => onUpdateSettings({ paused: !settings.paused })}
                className={`min-h-[40px] inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 border-[#2D241E] text-xs font-semibold cursor-pointer ${
                  settings.paused
                    ? 'bg-[#F59E0B] text-[#26211C]'
                    : 'bg-[#FFFDF8] text-[#26211C]'
                }`}
              >
                {settings.paused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                <span>{settings.paused ? 'Resume' : 'Pause'}</span>
              </button>
            </div>

            <div className="flex items-center justify-between gap-3">
              <span className="text-sm text-[#3F362D]">Facility Speed</span>
              <div className="flex items-center gap-1.5">
                {([1, 2] as const).map((spd) => (
                  <button
                    key={spd}
                    type="button"
                    onClick={() => onUpdateSettings({ simulationSpeed: spd })}
                    className={`min-h-[40px] min-w-[44px] px-3 py-1.5 rounded-lg border-2 border-[#2D241E] font-mono-num text-xs font-bold cursor-pointer ${
                      settings.simulationSpeed === spd
                        ? 'bg-[#0D9488] text-white'
                        : 'bg-[#FFFDF8] text-[#26211C]'
                    }`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Save Management & Recovery */}
          <div className="rounded-xl border-2 border-[#2D241E] bg-[#FFFDF8] p-4 space-y-3">
            <div>
              <h3 className="font-display text-sm font-bold text-[#26211C]">
                Save Management & Recovery
              </h3>
              <p className="text-[11px] text-[#6B5E51] mt-0.5">
                Progress auto-saves every 5 seconds and maintains an automatic recovery backup snapshot.
              </p>
            </div>
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  const ok = onManualSave();
                  setStatusMsg(
                    ok
                      ? 'Department saved cleanly to browser storage.'
                      : 'Warning: Browser storage blocked manual save — export JSON below.'
                  );
                }}
                className="min-h-[40px] inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border-2 border-[#2D241E] bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-semibold cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Now</span>
              </button>
              <button
                type="button"
                onClick={handleRestoreAutoBackup}
                disabled={!backupTimestamp}
                className={`min-h-[40px] inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border-2 border-[#2D241E] text-xs font-semibold ${
                  backupTimestamp
                    ? 'bg-[#EEF2FF] hover:bg-[#E0E7FF] text-[#312E81] cursor-pointer'
                    : 'bg-[#E5DDD0] text-[#7A6D60] cursor-not-allowed'
                }`}
              >
                <History className="w-3.5 h-3.5" />
                <span>Restore Backup</span>
              </button>
              <button
                type="button"
                onClick={handleCopySave}
                className="min-h-[40px] inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border-2 border-[#2D241E] bg-[#FFFDF8] hover:bg-[#EFE6D5] text-[#26211C] text-xs font-semibold cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export JSON</span>
              </button>
              <button
                type="button"
                onClick={handleLoadSave}
                className="min-h-[40px] inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border-2 border-[#2D241E] bg-[#FFFDF8] hover:bg-[#EFE6D5] text-[#26211C] text-xs font-semibold cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Import JSON</span>
              </button>
            </div>

            <textarea
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder="Paste exported save JSON here to restore..."
              rows={3}
              className="w-full rounded-lg border border-[#2D241E]/40 bg-[#FAF5EB] p-2 font-mono-num text-[11px] text-[#26211C]"
            />

            {statusMsg && (
              <p className="text-xs font-semibold text-[#0F766E]">{statusMsg}</p>
            )}
          </div>

          {/* Navigation & Reset */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={onReturnTitle}
                className="min-h-[42px] inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border-2 border-[#2D241E] bg-[#FFFDF8] hover:bg-[#EFE6D5] text-xs font-semibold cursor-pointer whitespace-nowrap"
              >
                <Home className="w-4 h-4" />
                <span>Title Screen</span>
              </button>

              {onReplayTutorial && (
                <button
                  type="button"
                  onClick={() => {
                    onReplayTutorial();
                    onClose();
                  }}
                  className="min-h-[42px] inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border-2 border-[#2D241E] bg-[#FEF6E4] hover:bg-[#FDE68A] text-[#26211C] text-xs font-semibold cursor-pointer whitespace-nowrap"
                >
                  <Play className="w-4 h-4" />
                  <span>Replay Tutorial</span>
                </button>
              )}
            </div>

            {!confirmReset ? (
              <button
                type="button"
                onClick={() => setConfirmReset(true)}
                className="min-h-[42px] inline-flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-[#2D241E] bg-[#FEE2E2] hover:bg-[#FECACA] text-[#991B1B] text-xs font-semibold cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset Department</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onResetGame();
                    setConfirmReset(false);
                    onClose();
                  }}
                  className="min-h-[42px] px-3 py-2 rounded-xl border-2 border-[#2D241E] bg-[#DC2626] text-white text-xs font-bold cursor-pointer"
                >
                  Confirm Reset
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmReset(false)}
                  className="min-h-[42px] px-3 py-2 rounded-xl border-2 border-[#2D241E] bg-[#FFFDF8] text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
