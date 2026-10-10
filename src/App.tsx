import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, getDocFromServer } from 'firebase/firestore';
import { auth, db } from './lib/firebase';
import { UserProfile, WordStatus } from './types';
import { Navbar } from './components/layout/Navbar';
import { FlashcardDeck } from './components/flashcards/FlashcardDeck';
import { DictationStudio } from './components/dictation/DictationStudio';
import { ContextualReading } from './components/reading/ContextualReading';
import { MiniGamesArena } from './components/minigames/MiniGamesArena';
import { WardrobeShop } from './components/mascot/WardrobeShop';
import { AuthModal } from './components/auth/AuthModal';
import { PipMascot } from './components/mascot/PipMascot';
import { isSoundEnabled, setSoundEnabled, playSound } from './lib/audio';

export default function App() {
  const [activeTab, setActiveTab] = useState<'flashcards' | 'dictation' | 'stories' | 'arena' | 'wardrobe'>('flashcards');
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [soundOn, setSoundOn] = useState(isSoundEnabled());

  // Default User Profile
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('lingopip_user_profile');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // ignore
        }
      }
    }
    return {
      id: 'local_guest',
      email: 'learner@lingopip.app',
      displayName: 'Learner Pip',
      isGuest: true,
      coins: 120, // starting balance
      streak: 3,
      lastActiveDate: new Date().toISOString().split('T')[0],
      equippedOutfit: 'outfit_default',
      unlockedOutfits: ['outfit_default'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  });

  // Word Progress Map: { [wordId]: 'new' | 'learning' | 'mastered' }
  const [wordProgress, setWordProgress] = useState<Record<string, WordStatus>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('lingopip_word_progress');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // ignore
        }
      }
    }
    return {
      w_coffee: 'mastered',
      w_breakfast: 'learning',
      w_weather: 'learning',
    };
  });

  // Sync state to LocalStorage
  useEffect(() => {
    localStorage.setItem('lingopip_user_profile', JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem('lingopip_word_progress', JSON.stringify(wordProgress));
  }, [wordProgress]);

  // Firestore Connection Test & Firebase Auth Listener
  useEffect(() => {
    // 1. Test Firestore connectivity
    async function testFirestoreConnection() {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.warn('Firebase client is offline or network restricted.');
        }
      }
    }
    testFirestoreConnection();

    // 2. Auth state observer
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        try {
          const userDocRef = doc(db, 'users', fbUser.uid);
          const snap = await getDoc(userDocRef);
          if (snap.exists()) {
            const data = snap.data() as UserProfile;
            setUserProfile(data);
          } else {
            // First time sync
            const newProfile: UserProfile = {
              id: fbUser.uid,
              email: fbUser.email || '',
              displayName: fbUser.displayName || 'Learner',
              photoURL: fbUser.photoURL || undefined,
              coins: userProfile.coins || 120,
              streak: userProfile.streak || 1,
              lastActiveDate: new Date().toISOString().split('T')[0],
              equippedOutfit: userProfile.equippedOutfit || 'outfit_default',
              unlockedOutfits: userProfile.unlockedOutfits || ['outfit_default'],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            await setDoc(userDocRef, newProfile);
            setUserProfile(newProfile);
          }
        } catch (e) {
          console.warn('Could not read user profile from Firestore:', e);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const handleUpdateProfile = (updated: Partial<UserProfile>) => {
    setUserProfile((prev) => {
      const merged = { ...prev, ...updated, updatedAt: new Date().toISOString() };
      // Sync to Firestore if signed in
      if (!merged.isGuest && auth.currentUser) {
        setDoc(doc(db, 'users', merged.id), merged, { merge: true }).catch((err) =>
          console.warn('Error saving to Firestore:', err)
        );
      }
      return merged;
    });
  };

  const handleEarnCoins = (amount: number) => {
    handleUpdateProfile({
      coins: userProfile.coins + amount,
    });
  };

  const handleUpdateWordStatus = (wordId: string, status: WordStatus) => {
    setWordProgress((prev) => {
      const updated = { ...prev, [wordId]: status };
      // Sync to Firestore if authenticated
      if (!userProfile.isGuest && auth.currentUser) {
        setDoc(
          doc(db, 'users', userProfile.id, 'wordProgress', wordId),
          {
            wordId,
            status,
            reviewCount: 1,
            lastReviewedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        ).catch((err) => console.warn('Error saving word progress:', err));
      }
      return updated;
    });
  };

  const handleToggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    setSoundEnabled(next);
    if (next) playSound('click');
  };

  return (
    <div className="min-h-screen bg-[#F4F6F8] text-slate-800 flex flex-col selection:bg-blue-100 selection:text-blue-900">
      {/* Navigation Top Bar */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        userProfile={userProfile}
        onOpenAuth={() => setIsAuthOpen(true)}
        soundOn={soundOn}
        onToggleSound={handleToggleSound}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {/* Subtle Hero Banner on Flashcards Tab */}
        {activeTab === 'flashcards' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-2">
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 rounded-3xl p-6 sm:p-8 text-white shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
              <div className="max-w-xl z-10">
                <div className="text-xs uppercase font-bold tracking-wider text-blue-200 mb-2">
                  A1 – B1 CEFR English Study Studio
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
                  Learn with Pip, your cute English companion!
                </h2>
                <p className="text-sm text-blue-100 leading-relaxed mb-4">
                  Master essential vocabulary with native audio pronunciation, IPA phonetic transcription, dictation typing, contextual stories, and fun mini-games. Earn coins to customize Pip’s wardrobe!
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => setActiveTab('dictation')}
                    className="px-4 py-2 bg-white text-blue-700 hover:bg-blue-50 text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    Start Dictation Studio →
                  </button>
                  <button
                    onClick={() => setActiveTab('wardrobe')}
                    className="px-4 py-2 bg-blue-700/60 hover:bg-blue-700/90 text-white text-xs font-semibold rounded-xl transition-colors border border-blue-400/30 cursor-pointer"
                  >
                    Visit Pip’s Wardrobe Shop 🛍️
                  </button>
                </div>
              </div>

              {/* Pip Mascot Quick Mini Widget in Banner */}
              <div className="relative shrink-0 z-10 flex flex-col items-center">
                <PipMascot
                  outfitId={userProfile.equippedOutfit}
                  rotation={0}
                  size="md"
                  mood="happy"
                  interactiveRotation={false}
                  showSpeech={true}
                  speechText={`Hi ${userProfile.displayName}! Ready to learn?`}
                />
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Tab Views */}
        {activeTab === 'flashcards' && (
          <FlashcardDeck
            wordProgress={wordProgress}
            onUpdateWordStatus={handleUpdateWordStatus}
            onEarnCoins={handleEarnCoins}
          />
        )}

        {activeTab === 'dictation' && (
          <DictationStudio onEarnCoins={handleEarnCoins} />
        )}

        {activeTab === 'stories' && (
          <ContextualReading onEarnCoins={handleEarnCoins} />
        )}

        {activeTab === 'arena' && (
          <MiniGamesArena onEarnCoins={handleEarnCoins} />
        )}

        {activeTab === 'wardrobe' && (
          <WardrobeShop
            userProfile={userProfile}
            onUpdateProfile={handleUpdateProfile}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">LingoPip</span>
            <span>·</span>
            <span>CEFR A1–B1 English Vocabulary Learning Web App</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>IPA Phonetic Engine</span>
            <span>·</span>
            <span>Interactive 360° Mascot Wardrobe</span>
            <span>·</span>
            <span>{userProfile.coins} Coins Saved</span>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        currentUser={userProfile}
        onAuthSuccess={(profile) => {
          setUserProfile(profile);
          setIsAuthOpen(false);
        }}
        onLogout={() => {
          setUserProfile({
            id: 'local_guest',
            email: 'learner@lingopip.app',
            displayName: 'Guest Learner',
            isGuest: true,
            coins: 120,
            streak: 1,
            lastActiveDate: new Date().toISOString().split('T')[0],
            equippedOutfit: 'outfit_default',
            unlockedOutfits: ['outfit_default'],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }}
      />
    </div>
  );
}
