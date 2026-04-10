'use client';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onEditProfile: () => void;
  onDisconnect: () => void;
  onShowAchievements: () => void;
  rateLimitInfo?: string | null;
}

export default function SettingsPanel({
  isOpen,
  onClose,
  onEditProfile,
  onDisconnect,
  onShowAchievements,
  rateLimitInfo,
}: SettingsPanelProps) {
  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div
        className="fixed top-0 right-0 z-50 w-full max-w-sm h-full bg-slate-800 border-l border-slate-700 shadow-xl overflow-y-auto"
        role="dialog"
        aria-label="Settings"
      >
        <div className="p-4 flex items-center justify-between border-b border-slate-700">
          <h2 className="text-lg font-bold text-white" style={{ fontFamily: 'monospace' }}>
            Settings
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            aria-label="Close settings"
          >
            ✕
          </button>
        </div>
        <div className="p-4 space-y-2">
          <button
            type="button"
            onClick={() => { onEditProfile(); onClose(); }}
            className="w-full px-4 py-3 text-left rounded-lg bg-slate-700/50 hover:bg-slate-700 text-white font-medium transition-colors"
          >
            Edit Profile
          </button>
          <button
            type="button"
            onClick={onShowAchievements}
            className="w-full px-4 py-3 text-left rounded-lg bg-slate-700/50 hover:bg-slate-700 text-white font-medium transition-colors"
          >
            View Achievements
          </button>
          <button
            type="button"
            onClick={() => { onDisconnect(); onClose(); }}
            className="w-full px-4 py-3 text-left rounded-lg bg-red-900/30 hover:bg-red-900/50 text-red-300 font-medium transition-colors border border-red-700/50"
          >
            Disconnect Strava
          </button>
          {rateLimitInfo && (
            <div className="mt-4 p-3 rounded-lg bg-slate-700/50 text-xs text-gray-400" title="Strava API rate limit">
              {rateLimitInfo}
            </div>
          )}
          <div className="pt-4 mt-4 border-t border-slate-700 text-xs text-gray-500">
            Sporty Gotchi · v3
          </div>
        </div>
      </div>
    </>
  );
}
