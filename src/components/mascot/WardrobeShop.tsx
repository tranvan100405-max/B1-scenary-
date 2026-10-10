import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { MASCOT_OUTFITS } from '../../data/outfitsData';
import { MascotOutfit, OutfitCategory, UserProfile } from '../../types';
import { PipMascot } from './PipMascot';
import { playSound } from '../../lib/audio';

interface WardrobeShopProps {
  userProfile: UserProfile;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
}

export const WardrobeShop: React.FC<WardrobeShopProps> = ({ userProfile, onUpdateProfile }) => {
  const [selectedOutfitId, setSelectedOutfitId] = useState<string>(userProfile.equippedOutfit);
  const [previewOutfitId, setPreviewOutfitId] = useState<string>(userProfile.equippedOutfit);
  const [rotationAngle, setRotationAngle] = useState<number>(0);
  const [selectedCategory, setSelectedCategory] = useState<OutfitCategory | 'All'>('All');
  const [mascotMood, setMascotMood] = useState<'happy' | 'cheering' | 'thinking' | 'curious'>('happy');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const activeOutfit = MASCOT_OUTFITS.find((o) => o.id === previewOutfitId) || MASCOT_OUTFITS[0];
  const isUnlocked = userProfile.unlockedOutfits.includes(activeOutfit.id);
  const isCurrentlyEquipped = userProfile.equippedOutfit === activeOutfit.id;
  const isTryingOn = previewOutfitId !== userProfile.equippedOutfit;

  const categories: (OutfitCategory | 'All')[] = ['All', 'Fun & Cute', 'Smart & Academic', 'Adventurer'];

  const filteredOutfits = MASCOT_OUTFITS.filter(
    (o) => selectedCategory === 'All' || o.category === selectedCategory
  );

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleTryOn = (outfit: MascotOutfit) => {
    setPreviewOutfitId(outfit.id);
    setSelectedOutfitId(outfit.id);
    setMascotMood('curious');
    playSound('click');
    showToast(`Fitting room: Trying on ${outfit.name}!`);
    setTimeout(() => setMascotMood('happy'), 1200);
  };

  const handleEquip = (outfit: MascotOutfit) => {
    if (!userProfile.unlockedOutfits.includes(outfit.id)) return;

    onUpdateProfile({
      equippedOutfit: outfit.id,
    });
    setPreviewOutfitId(outfit.id);
    setSelectedOutfitId(outfit.id);
    setMascotMood('cheering');
    playSound('equip');

    // Confetti celebration
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#DB2777', '#F43F5E', '#FBBF24', '#38BDF8'],
    });

    showToast(`🎉 Equipped ${outfit.name}! Pip looks thrilled!`);
    setTimeout(() => setMascotMood('happy'), 3000);
  };

  const handleBuy = (outfit: MascotOutfit) => {
    if (userProfile.coins < outfit.price) {
      playSound('wrong');
      showToast(`⚠️ Need ${outfit.price - userProfile.coins} more coins! Complete flashcards or quizzes.`);
      setMascotMood('thinking');
      setTimeout(() => setMascotMood('happy'), 1800);
      return;
    }

    const newCoins = userProfile.coins - outfit.price;
    const newUnlocked = [...userProfile.unlockedOutfits, outfit.id];

    onUpdateProfile({
      coins: newCoins,
      unlockedOutfits: newUnlocked,
      equippedOutfit: outfit.id,
    });

    setPreviewOutfitId(outfit.id);
    setSelectedOutfitId(outfit.id);
    setMascotMood('cheering');
    playSound('equip');

    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.55 },
      colors: ['#DB2777', '#10B981', '#F59E0B', '#3B82F6'],
    });

    showToast(`✨ Purchased and equipped ${outfit.name}! (-${outfit.price} Coins)`);
    setTimeout(() => setMascotMood('happy'), 3200);
  };

  const handleResetFittingRoom = () => {
    setPreviewOutfitId(userProfile.equippedOutfit);
    setSelectedOutfitId(userProfile.equippedOutfit);
    playSound('click');
    showToast('Reset to equipped outfit');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-lg text-sm font-medium animate-bounce flex items-center gap-2">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header with Title and User Balance */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-pink-600 mb-1">
            <span>AI Mascot Companion</span>
            <span>·</span>
            <span>Wardrobe Fitting Studio</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Pip’s Wardrobe Shop</h1>
          <p className="text-sm text-slate-600 mt-1 max-w-xl">
            Dress Pip in adorable themed outfits. Try on outfits in 360°, purchase with your earned coins, and take your stylish companion on learning adventures!
          </p>
        </div>

        {/* User Coin Balance */}
        <div className="flex items-center gap-3 bg-pink-50 border border-pink-100 rounded-2xl px-5 py-3 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-pink-500/10 flex items-center justify-center text-xl">
            🪙
          </div>
          <div>
            <div className="text-xs font-medium text-pink-700">Available Coins</div>
            <div className="text-2xl font-bold text-slate-900 tabular-nums">
              {userProfile.coins}
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Stage (360 Preview & Controls) + Right Catalog */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Zone: 360-Degree Interactive Fitting Room Stage */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col items-center">
          {/* Fitting Room Status Banner */}
          <div className="w-full flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-pink-500 animate-pulse" />
              <span className="text-xs font-semibold text-slate-700">
                {isTryingOn ? 'Virtual Fitting Room (Preview)' : 'Currently Equipped'}
              </span>
            </div>
            {isTryingOn && (
              <button
                onClick={handleResetFittingRoom}
                className="text-xs font-medium text-pink-600 hover:text-pink-700 transition-colors cursor-pointer"
              >
                Reset Fitting
              </button>
            )}
          </div>

          {/* Interactive Mascot Character */}
          <div className="py-4">
            <PipMascot
              outfitId={previewOutfitId}
              rotation={rotationAngle}
              onRotationChange={setRotationAngle}
              interactiveRotation={true}
              mood={mascotMood}
              size="xl"
              showSpeech={true}
              speechText={activeOutfit.tagline}
            />
          </div>

          {/* 360-Degree Rotation Slider Control */}
          <div className="w-full mt-6 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs text-slate-600 mb-2 font-medium">
              <span>360° Turntable Angle</span>
              <span className="tabular-nums font-semibold text-pink-600">{rotationAngle}°</span>
            </div>
            <input
              type="range"
              min="0"
              max="360"
              value={rotationAngle}
              onChange={(e) => setRotationAngle(Number(e.target.value))}
              className="w-full accent-pink-600 cursor-pointer h-2 bg-slate-100 rounded-lg"
            />
            <div className="flex justify-between text-[11px] text-slate-400 mt-1">
              <span>Front (0°)</span>
              <span>Side (90°)</span>
              <span>Back (180°)</span>
              <span>Side (270°)</span>
              <span>Front (360°)</span>
            </div>
          </div>

          {/* Active Preview Outfit Summary Card */}
          <div className="w-full mt-6 p-4 rounded-xl bg-pink-50/60 border border-pink-100/80">
            <div className="flex items-center justify-between mb-1.5">
              <h3 className="font-bold text-slate-900 text-base">{activeOutfit.name}</h3>
              <span className="text-xs font-semibold text-pink-700">
                {activeOutfit.category}
              </span>
            </div>
            <p className="text-xs text-slate-600 mb-3 leading-relaxed">
              {activeOutfit.description}
            </p>

            {/* Key Features Bulletless List */}
            <div className="flex flex-wrap gap-1.5 mb-4 text-[11px] text-slate-600">
              {activeOutfit.features.map((feat, idx) => (
                <span key={idx} className="bg-white px-2 py-0.5 rounded-md border border-pink-100 font-medium">
                  {feat}
                </span>
              ))}
            </div>

            {/* Primary Action Button */}
            {isCurrentlyEquipped ? (
              <div className="w-full py-2.5 px-4 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-center text-xs font-semibold flex items-center justify-center gap-1.5">
                <span>✓ Currently Wearing</span>
              </div>
            ) : isUnlocked ? (
              <button
                onClick={() => handleEquip(activeOutfit)}
                className="w-full py-2.5 px-4 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-xs font-semibold transition-colors shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Equip Outfit</span>
              </button>
            ) : (
              <button
                onClick={() => handleBuy(activeOutfit)}
                className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors shadow-xs cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Unlock for {activeOutfit.price} Coins</span>
                <span className="text-amber-300">🪙</span>
              </button>
            )}
          </div>
        </div>

        {/* Right Zone: Wardrobe Catalog */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Category Filter Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl overflow-x-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  playSound('click');
                }}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Outfits Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredOutfits.map((outfit) => {
              const unlocked = userProfile.unlockedOutfits.includes(outfit.id);
              const equipped = userProfile.equippedOutfit === outfit.id;
              const isSelected = previewOutfitId === outfit.id;

              return (
                <div
                  key={outfit.id}
                  onClick={() => handleTryOn(outfit)}
                  className={`relative p-5 rounded-2xl border transition-all cursor-pointer bg-white flex flex-col justify-between ${
                    isSelected
                      ? 'border-pink-500 ring-2 ring-pink-500/20 shadow-md'
                      : 'border-slate-200/80 hover:border-slate-300 hover:shadow-xs'
                  }`}
                >
                  <div>
                    {/* Top row with Category and Status */}
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                      <span>{outfit.category}</span>
                      {equipped ? (
                        <span className="text-emerald-600 font-semibold text-[11px]">Equipped</span>
                      ) : unlocked ? (
                        <span className="text-blue-600 font-medium text-[11px]">Owned</span>
                      ) : (
                        <span className="font-semibold text-slate-900 tabular-nums flex items-center gap-1 text-[11px]">
                          🪙 {outfit.price}
                        </span>
                      )}
                    </div>

                    {/* Outfit Name */}
                    <h3 className="text-base font-bold text-slate-900 mb-1">{outfit.name}</h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed">
                      {outfit.description}
                    </p>
                  </div>

                  {/* Actions Row */}
                  <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTryOn(outfit);
                      }}
                      className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-lg transition-colors cursor-pointer text-center ${
                        isSelected
                          ? 'bg-pink-100 text-pink-700'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      Try On 360°
                    </button>

                    {equipped ? (
                      <span className="text-xs font-semibold text-emerald-600 px-2 py-1">Active</span>
                    ) : unlocked ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEquip(outfit);
                        }}
                        className="py-1.5 px-3 text-xs font-semibold rounded-lg bg-pink-600 hover:bg-pink-700 text-white transition-colors cursor-pointer"
                      >
                        Equip
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBuy(outfit);
                        }}
                        className="py-1.5 px-3 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 text-white transition-colors cursor-pointer"
                      >
                        Buy
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Coin Earning Guide */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600">
            <div className="font-semibold text-slate-800 mb-1 flex items-center gap-1.5">
              <span>💡 How to earn more coins for Pip:</span>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-slate-500">
              <span>· Master a Flashcard: +5 coins</span>
              <span>· Complete a Dictation: +10 coins</span>
              <span>· Reading Comprehension Quiz: +15 coins</span>
              <span>· Mini-games Win: +20 coins</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
