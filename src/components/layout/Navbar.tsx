import React from 'react';
import { UserProfile } from '../../types';
import { isSoundEnabled, setSoundEnabled, playSound } from '../../lib/audio';

interface NavbarProps {
  activeTab: 'flashcards' | 'dictation' | 'stories' | 'arena' | 'wardrobe';
  onSelectTab: (tab: 'flashcards' | 'dictation' | 'stories' | 'arena' | 'wardrobe') => void;
  userProfile: UserProfile;
  onOpenAuth: () => void;
  soundOn: boolean;
  onToggleSound: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  userProfile,
  onOpenAuth,
  soundOn,
  onToggleSound,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-8 h-16">
        {/* Zone 1: Single Wordmark Brand Zone */}
        <div
          onClick={() => onSelectTab('flashcards')}
          className="flex items-center gap-2.5 cursor-pointer whitespace-nowrap shrink-0"
        >
          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-xs">
            🦊
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900 font-heading">
            LingoPip
          </span>
        </div>

        {/* Zone 2: 4–5 single-line clean text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <button
            onClick={() => {
              onSelectTab('flashcards');
              playSound('click');
            }}
            className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer py-1 ${
              activeTab === 'flashcards'
                ? 'text-blue-600 font-semibold border-b-2 border-blue-600'
                : 'hover:text-slate-900'
            }`}
          >
            Flashcards
          </button>

          <button
            onClick={() => {
              onSelectTab('dictation');
              playSound('click');
            }}
            className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer py-1 ${
              activeTab === 'dictation'
                ? 'text-sky-600 font-semibold border-b-2 border-sky-600'
                : 'hover:text-slate-900'
            }`}
          >
            Dictation
          </button>

          <button
            onClick={() => {
              onSelectTab('stories');
              playSound('click');
            }}
            className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer py-1 ${
              activeTab === 'stories'
                ? 'text-amber-600 font-semibold border-b-2 border-amber-600'
                : 'hover:text-slate-900'
            }`}
          >
            Stories
          </button>

          <button
            onClick={() => {
              onSelectTab('arena');
              playSound('click');
            }}
            className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer py-1 ${
              activeTab === 'arena'
                ? 'text-orange-600 font-semibold border-b-2 border-orange-600'
                : 'hover:text-slate-900'
            }`}
          >
            Arena
          </button>

          <button
            onClick={() => {
              onSelectTab('wardrobe');
              playSound('click');
            }}
            className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer py-1 ${
              activeTab === 'wardrobe'
                ? 'text-pink-600 font-semibold border-b-2 border-pink-600'
                : 'hover:text-slate-900'
            }`}
          >
            Wardrobe Shop
          </button>
        </nav>

        {/* Zone 3: Primary Action & User Gamification Stats */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            title={soundOn ? 'Mute audio' : 'Unmute audio'}
          >
            {soundOn ? '🔊' : '🔇'}
          </button>

          {/* User Streak */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-50 border border-orange-100 text-xs font-semibold text-orange-700">
            <span>🔥</span>
            <span className="tabular-nums">{userProfile.streak}d</span>
          </div>

          {/* User Coins */}
          <div
            onClick={() => onSelectTab('wardrobe')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-xs font-bold text-amber-800 cursor-pointer hover:bg-amber-100 transition-colors"
            title="Spend in Wardrobe Shop"
          >
            <span>🪙</span>
            <span className="tabular-nums">{userProfile.coins}</span>
          </div>

          {/* Account Button / Avatar */}
          <button
            onClick={onOpenAuth}
            className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors cursor-pointer shrink-0"
          >
            <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs">
              {userProfile.displayName ? userProfile.displayName[0].toUpperCase() : '👤'}
            </div>
            <span className="max-w-[70px] truncate hidden sm:inline">
              {userProfile.displayName}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Secondary Sub-navigation row */}
      <div className="md:hidden flex items-center justify-start sm:justify-around gap-1.5 border-t border-slate-100 px-3 py-2 bg-slate-50/60 overflow-x-auto no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden text-xs">
        <button
          onClick={() => onSelectTab('flashcards')}
          className={`shrink-0 whitespace-nowrap px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
            activeTab === 'flashcards' ? 'bg-blue-600 text-white font-semibold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Flashcards
        </button>
        <button
          onClick={() => onSelectTab('dictation')}
          className={`shrink-0 whitespace-nowrap px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
            activeTab === 'dictation' ? 'bg-sky-600 text-white font-semibold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Dictation
        </button>
        <button
          onClick={() => onSelectTab('stories')}
          className={`shrink-0 whitespace-nowrap px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
            activeTab === 'stories' ? 'bg-amber-600 text-white font-semibold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Stories
        </button>
        <button
          onClick={() => onSelectTab('arena')}
          className={`shrink-0 whitespace-nowrap px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
            activeTab === 'arena' ? 'bg-orange-600 text-white font-semibold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Arena
        </button>
        <button
          onClick={() => onSelectTab('wardrobe')}
          className={`shrink-0 whitespace-nowrap px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
            activeTab === 'wardrobe' ? 'bg-pink-600 text-white font-semibold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Wardrobe
        </button>
      </div>
    </header>
  );
};
