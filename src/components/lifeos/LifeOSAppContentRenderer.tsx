import React from 'react';
import { useLifeOS } from '../../context/LifeOSContext';
import { useSettings } from '../../context/SettingsContext';
import { FaithLingoWindowContent } from './FaithLingoWindowContent';
import { BibleJournalApp } from '../journal/BibleJournalApp';
import { DiscordFellowshipApp } from '../chat/DiscordFellowshipApp';
import { LifeMeetApp } from '../meet/LifeMeetApp';
import { CatFighterApp } from '../cat-fighter/CatFighterApp';
import { ArcadeVaultApp } from '../mini-games/ArcadeVaultApp';
import { YouTubeApp } from '../youtube/YouTubeApp';
import { TikTokApp } from '../tiktok/TikTokApp';
import { AppStudio } from './AppStudio';
import { CustomAppRunner } from './CustomAppRunner';

interface LifeOSAppContentRendererProps {
  appId: string;
  onReturnToDesktop?: () => void;
}

export const LifeOSAppContentRenderer: React.FC<LifeOSAppContentRendererProps> = ({
  appId,
  onReturnToDesktop
}) => {
  const { apps, showDesktop } = useLifeOS();
  const { settings } = useSettings();

  const app = apps.find(a => a.id === appId);

  if (!app) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-stone-950 text-white">
        <p className="text-sm text-stone-400">Application not found: {appId}</p>
      </div>
    );
  }

  // Check if disabled by system administrator
  if (settings.appVisibility && settings.appVisibility[appId] === false) {
    return (
      <div className="h-full min-h-[300px] flex flex-col items-center justify-center p-8 text-center bg-stone-950/95 text-white">
        <div className="w-16 h-16 rounded-3xl bg-rose-500/10 border-2 border-rose-500/30 flex items-center justify-center text-3xl mb-4">
          🔒
        </div>
        <h3 className="text-lg font-black text-white mb-2">{app.title} Disabled</h3>
        <p className="text-xs text-stone-400 max-w-sm mb-6 leading-relaxed">
          This application has been temporarily disabled across LifeOS by the system administrator.
        </p>
        <button
          onClick={onReturnToDesktop || showDesktop}
          className="px-5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-xs font-black uppercase tracking-wider text-white transition-all shadow-md active:scale-95"
        >
          Return to Desktop
        </button>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex-1 flex flex-col overflow-hidden min-h-0 relative">
      {appId === 'faithlingo' && <FaithLingoWindowContent />}
      {appId === 'bible_journal' && <BibleJournalApp />}
      {appId === 'fellowship_chat' && <DiscordFellowshipApp />}
      {appId === 'faith_meet' && <LifeMeetApp />}
      {appId === 'mini_cats' && <CatFighterApp />}
      {appId === 'mini_games' && <ArcadeVaultApp />}
      {appId === 'youtube' && <YouTubeApp />}
      {appId === 'tiktok' && <TikTokApp />}
      {appId === 'app_studio' && <AppStudio />}
      {appId !== 'faithlingo' &&
        appId !== 'bible_journal' &&
        appId !== 'fellowship_chat' &&
        appId !== 'faith_meet' &&
        appId !== 'mini_cats' &&
        appId !== 'mini_games' &&
        appId !== 'youtube' &&
        appId !== 'tiktok' &&
        appId !== 'app_studio' && (
          <CustomAppRunner app={app} />
        )}
    </div>
  );
};
