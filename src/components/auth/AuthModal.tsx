import React, { useState } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { auth, signInWithGoogle, logoutUser } from '../../lib/firebase';
import { UserProfile } from '../../types';
import { playSound } from '../../lib/audio';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onAuthSuccess: (user: UserProfile) => void;
  onLogout: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onAuthSuccess,
  onLogout,
}) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const profile = await signInWithGoogle();
      if (profile) {
        playSound('correct');
        onAuthSuccess(profile);
        onClose();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Google sign-in error';
      setErrorMessage(msg);
      playSound('wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      if (isRegistering) {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        if (displayName && cred.user) {
          await updateProfile(cred.user, { displayName });
        }
        const profile: UserProfile = {
          id: cred.user.uid,
          email: cred.user.email || email,
          displayName: displayName || email.split('@')[0],
          coins: 120,
          streak: 1,
          lastActiveDate: new Date().toISOString().split('T')[0],
          equippedOutfit: 'outfit_default',
          unlockedOutfits: ['outfit_default'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        playSound('correct');
        onAuthSuccess(profile);
        onClose();
      } else {
        const cred = await signInWithEmailAndPassword(auth, email, password);
        const profile: UserProfile = {
          id: cred.user.uid,
          email: cred.user.email || email,
          displayName: cred.user.displayName || email.split('@')[0],
          coins: currentUser?.coins ?? 120,
          streak: currentUser?.streak ?? 1,
          lastActiveDate: new Date().toISOString().split('T')[0],
          equippedOutfit: currentUser?.equippedOutfit || 'outfit_default',
          unlockedOutfits: currentUser?.unlockedOutfits || ['outfit_default'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        playSound('correct');
        onAuthSuccess(profile);
        onClose();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Authentication failed';
      setErrorMessage(msg);
      playSound('wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickGuest = () => {
    const guestProfile: UserProfile = {
      id: `guest_${Date.now()}`,
      email: 'guest@lingopip.app',
      displayName: 'Guest Learner',
      isGuest: true,
      coins: currentUser?.coins ?? 120,
      streak: currentUser?.streak ?? 1,
      lastActiveDate: new Date().toISOString().split('T')[0],
      equippedOutfit: currentUser?.equippedOutfit || 'outfit_default',
      unlockedOutfits: currentUser?.unlockedOutfits || ['outfit_default'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    playSound('correct');
    onAuthSuccess(guestProfile);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 cursor-pointer p-1 rounded-lg"
          aria-label="Close dialog"
        >
          ✕
        </button>

        {currentUser && !currentUser.isGuest ? (
          /* Profile view for logged in user */
          <div>
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-2xl font-bold mx-auto mb-3">
                {currentUser.displayName ? currentUser.displayName[0].toUpperCase() : '👤'}
              </div>
              <h2 className="text-xl font-bold text-slate-900">{currentUser.displayName}</h2>
              <p className="text-xs text-slate-500">{currentUser.email}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
              <div>
                <div className="text-xs text-slate-500 font-medium">Coins Balance</div>
                <div className="text-xl font-bold text-amber-600 tabular-nums">🪙 {currentUser.coins}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500 font-medium">Learning Streak</div>
                <div className="text-xl font-bold text-orange-600 tabular-nums">🔥 {currentUser.streak} days</div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={async () => {
                  await logoutUser();
                  onLogout();
                  onClose();
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          </div>
        ) : (
          /* Sign-in / Register Form */
          <div>
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-2xl mx-auto mb-2">
                🦊
              </div>
              <h2 className="text-xl font-bold text-slate-900">
                {isRegistering ? 'Create LingoPip Account' : 'Welcome to LingoPip'}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Save your learned vocabulary, coins, and custom Pip wardrobe outfits across devices.
              </p>
            </div>

            {errorMessage && (
              <div className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {errorMessage}
              </div>
            )}

            {/* Google One-Click Login */}
            <button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-800 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer mb-4 shadow-2xs"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-[11px] text-slate-400 font-medium">or email</span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>

            {/* Email / Password Form */}
            <form onSubmit={handleEmailAuth} className="space-y-3">
              {isRegistering && (
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. Alex"
                    className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                  />
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs mt-2"
              >
                {isLoading ? 'Processing...' : isRegistering ? 'Register Account' : 'Sign In'}
              </button>
            </form>

            {/* Switch between sign-in and register */}
            <div className="text-center mt-4">
              <button
                type="button"
                onClick={() => {
                  setIsRegistering(!isRegistering);
                  setErrorMessage(null);
                }}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
              >
                {isRegistering
                  ? 'Already have an account? Sign in'
                  : "Don't have an account? Register"}
              </button>
            </div>

            {/* Guest Option */}
            <div className="mt-6 pt-4 border-t border-slate-100 text-center">
              <button
                type="button"
                onClick={handleQuickGuest}
                className="text-xs text-slate-500 hover:text-slate-700 font-medium cursor-pointer"
              >
                Continue as Guest (No password needed) →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
