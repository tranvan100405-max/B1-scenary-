import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { VOCABULARY_LIST } from '../../data/vocabData';
import { VocabWord } from '../../types';
import { speakWord, playSound } from '../../lib/audio';

interface DictationStudioProps {
  onEarnCoins: (amount: number) => void;
}

export const DictationStudio: React.FC<DictationStudioProps> = ({ onEarnCoins }) => {
  const [wordIndex, setWordIndex] = useState(0);
  const [userInput, setUserInput] = useState<string>('');
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const [revealedHintIndex, setRevealedHintIndex] = useState<number>(0); // 0: none, 1: definition, 2: IPA, 3: reveal 1st letter
  const [isSuccess, setIsSuccess] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [streak, setStreak] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentWord: VocabWord = VOCABULARY_LIST[wordIndex % VOCABULARY_LIST.length];
  const targetWord = currentWord.word.toLowerCase();

  // Play audio on new word
  useEffect(() => {
    setUserInput('');
    setIsSuccess(false);
    setHasError(false);
    setRevealedHintIndex(0);
    // Focus input
    if (inputRef.current) {
      inputRef.current.focus();
    }
    // Speak automatically on load
    const timer = setTimeout(() => {
      speakWord(currentWord.word, speechRate);
    }, 300);
    return () => clearTimeout(timer);
  }, [wordIndex, speechRate]);

  const handlePlayAudio = (rate = speechRate) => {
    speakWord(currentWord.word, rate);
    playSound('click');
  };

  const handleCheck = (val: string) => {
    const cleaned = val.trim().toLowerCase();
    setUserInput(cleaned);

    if (cleaned === targetWord) {
      setIsSuccess(true);
      setHasError(false);
      setStreak((prev) => prev + 1);
      playSound('correct');
      playSound('coin');
      onEarnCoins(10);

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.65 },
        colors: ['#0284C7', '#38BDF8', '#F59E0B'],
      });
    } else if (cleaned.length === targetWord.length) {
      setHasError(true);
      playSound('wrong');
      setTimeout(() => setHasError(false), 500);
    }
  };

  const handleNextWord = () => {
    setWordIndex((prev) => (prev + 1) % VOCABULARY_LIST.length);
  };

  const handleSkipWord = () => {
    setStreak(0);
    handleNextWord();
  };

  const handleAddHint = () => {
    setRevealedHintIndex((prev) => Math.min(3, prev + 1));
    playSound('click');
  };

  // Keyboard support for letter taps
  const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Module Header with Soft Sky Blue Accent */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-sky-800 mb-1">
            <span>Listening & Dictation Studio</span>
            <span>·</span>
            <span>Spelling Mastery</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Spelling & Dictation</h1>
          <p className="text-sm text-slate-600 mt-1">
            Listen closely to the audio, type the letters accurately, and strengthen your ear-to-word recall.
          </p>
        </div>

        {/* Streak and Reward Badge */}
        <div className="flex items-center gap-3 bg-[#E0F2FE] border border-sky-200 rounded-2xl px-5 py-3">
          <div className="text-xs">
            <span className="text-sky-900 font-bold tabular-nums text-sm">🔥 {streak}</span>
            <span className="text-sky-800 ml-1 font-medium">Streak</span>
          </div>
          <span className="text-sky-300">|</span>
          <div className="text-xs font-semibold text-sky-900 flex items-center gap-1">
            <span>+10 🪙 per word</span>
          </div>
        </div>
      </div>

      {/* Main Studio Card */}
      <div
        className={`bg-white rounded-3xl border transition-all p-8 shadow-sm flex flex-col items-center relative overflow-hidden ${
          isSuccess
            ? 'border-emerald-400 ring-2 ring-emerald-500/20'
            : hasError
            ? 'border-rose-400 animate-shake'
            : 'border-slate-200/80'
        }`}
      >
        {/* Sky Blue top decorative gradient accent */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-sky-400 to-blue-500" />

        {/* Audio Player Controls */}
        <div className="my-6 flex flex-col items-center">
          <button
            onClick={() => handlePlayAudio(speechRate)}
            className="w-20 h-20 rounded-full bg-[#0284C7] hover:bg-[#0369a1] text-white flex items-center justify-center shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer mb-3"
            aria-label="Play sound"
          >
            <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePlayAudio(1.0)}
              className="px-3.5 py-1.5 rounded-full bg-sky-50 text-sky-800 hover:bg-sky-100 text-xs font-semibold border border-sky-100 cursor-pointer flex items-center gap-1"
            >
              <span>Normal (1.0x)</span>
            </button>
            <button
              onClick={() => handlePlayAudio(0.7)}
              className="px-3.5 py-1.5 rounded-full bg-sky-50 text-sky-800 hover:bg-sky-100 text-xs font-semibold border border-sky-100 cursor-pointer flex items-center gap-1"
            >
              <span>Slow Turtle (0.7x)</span>
            </button>
          </div>
        </div>

        {/* Word Boxes (Letter-by-Letter Display) */}
        <div className="flex flex-wrap justify-center gap-2 mb-8 max-w-lg">
          {targetWord.split('').map((char, index) => {
            const enteredChar = userInput[index] || '';
            const isFilled = index < userInput.length;
            const isCurrent = index === userInput.length;

            return (
              <div
                key={index}
                className={`w-11 h-14 rounded-xl flex items-center justify-center text-2xl font-bold uppercase transition-all border-2 ${
                  isSuccess
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                    : isFilled
                    ? 'bg-sky-50 border-sky-400 text-sky-950'
                    : isCurrent
                    ? 'border-sky-500 bg-white ring-2 ring-sky-200'
                    : 'border-slate-200 bg-slate-50/50 text-slate-300'
                }`}
              >
                {isSuccess ? char : enteredChar || ''}
              </div>
            );
          })}
        </div>

        {/* Hidden Input field for physical keyboard typing */}
        <input
          ref={inputRef}
          type="text"
          value={userInput}
          disabled={isSuccess}
          onChange={(e) => handleCheck(e.target.value)}
          maxLength={targetWord.length}
          autoFocus
          className="opacity-0 absolute -z-10"
        />

        {/* Physical input trigger button if mobile keyboard dismisses */}
        <button
          onClick={() => inputRef.current?.focus()}
          className="text-xs text-slate-400 hover:text-slate-600 mb-6 flex items-center gap-1 cursor-pointer"
        >
          <span>Tap to activate keyboard ({userInput.length}/{targetWord.length} letters)</span>
        </button>

        {/* Success Banner */}
        {isSuccess && (
          <div className="w-full max-w-md bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center mb-6 animate-bounce">
            <div className="text-emerald-800 font-bold text-base mb-1">
              🎉 Correct! +10 Coins
            </div>
            <p className="text-xs text-emerald-700 mb-2">
              <span className="font-semibold">{currentWord.word}</span> ({currentWord.ipa}) — {currentWord.vietnamese}
            </p>
            <button
              onClick={handleNextWord}
              className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer"
            >
              Next Word →
            </button>
          </div>
        )}

        {/* Hints Panel */}
        <div className="w-full max-w-md border-t border-slate-100 pt-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-700">Hints & Clues</span>
            {revealedHintIndex < 3 && !isSuccess && (
              <button
                onClick={handleAddHint}
                className="text-xs text-sky-600 hover:text-sky-700 font-medium cursor-pointer"
              >
                + Unlock Hint {revealedHintIndex + 1}/3
              </button>
            )}
          </div>

          <div className="space-y-2 text-xs">
            {revealedHintIndex >= 1 && (
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 flex items-start gap-2">
                <span className="font-semibold text-slate-500">Meaning:</span>
                <span>{currentWord.definition} ({currentWord.vietnamese})</span>
              </div>
            )}
            {revealedHintIndex >= 2 && (
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 flex items-center gap-2">
                <span className="font-semibold text-slate-500">Phonetics:</span>
                <span className="font-mono text-sky-700">{currentWord.ipa}</span>
              </div>
            )}
            {revealedHintIndex >= 3 && (
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 flex items-center gap-2">
                <span className="font-semibold text-slate-500">First Letter:</span>
                <span className="font-bold text-sky-700 uppercase">'{targetWord[0]}'</span>
              </div>
            )}
            {revealedHintIndex === 0 && !isSuccess && (
              <p className="text-slate-400 italic text-[11px]">
                Need help? Tap "+ Unlock Hint" above to reveal clues!
              </p>
            )}
          </div>
        </div>

        {/* Quick Actions Footer */}
        <div className="w-full max-w-md flex items-center justify-between mt-6 pt-4 border-t border-slate-100 text-xs">
          <button
            onClick={() => setUserInput('')}
            disabled={isSuccess}
            className="text-slate-500 hover:text-slate-700 font-medium cursor-pointer"
          >
            Clear letters
          </button>

          <button
            onClick={handleSkipWord}
            className="text-slate-500 hover:text-slate-700 font-medium cursor-pointer"
          >
            Skip Word →
          </button>
        </div>
      </div>
    </div>
  );
};
