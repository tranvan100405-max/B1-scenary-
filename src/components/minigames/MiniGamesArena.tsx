import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { VOCABULARY_LIST } from '../../data/vocabData';
import { VocabWord } from '../../types';
import { speakWord, playSound } from '../../lib/audio';

interface MiniGamesArenaProps {
  onEarnCoins: (amount: number) => void;
}

type MiniGameMode = 'speed_match' | 'fill_blank' | 'audio_blitz';

export const MiniGamesArena: React.FC<MiniGamesArenaProps> = ({ onEarnCoins }) => {
  const [activeMode, setActiveMode] = useState<MiniGameMode>('speed_match');

  /* ----------------------------------------------------
     GAME 1: SPEED MATCHING (Pairs matching under timer)
  ---------------------------------------------------- */
  interface MatchCard {
    id: string; // word id or def id
    wordId: string;
    text: string;
    isWord: boolean;
    isMatched: boolean;
  }

  const [matchCards, setMatchCards] = useState<MatchCard[]>([]);
  const [selectedMatchCard, setSelectedMatchCard] = useState<MatchCard | null>(null);
  const [matchTimeLeft, setMatchTimeLeft] = useState<number>(60);
  const [isMatchRunning, setIsMatchRunning] = useState<boolean>(false);
  const [matchCombo, setMatchCombo] = useState<number>(1);
  const [matchScore, setMatchScore] = useState<number>(0);
  const [isMatchGameOver, setIsMatchGameOver] = useState<boolean>(false);

  const initSpeedMatchGame = () => {
    // Pick 6 random vocabulary items
    const shuffledVocab = [...VOCABULARY_LIST].sort(() => Math.random() - 0.5).slice(0, 6);
    const cards: MatchCard[] = [];

    shuffledVocab.forEach((v) => {
      // English card
      cards.push({
        id: `word_${v.id}`,
        wordId: v.id,
        text: v.word,
        isWord: true,
        isMatched: false,
      });
      // Vietnamese card
      cards.push({
        id: `trans_${v.id}`,
        wordId: v.id,
        text: v.vietnamese,
        isWord: false,
        isMatched: false,
      });
    });

    setMatchCards(cards.sort(() => Math.random() - 0.5));
    setSelectedMatchCard(null);
    setMatchTimeLeft(50);
    setIsMatchRunning(true);
    setMatchCombo(1);
    setMatchScore(0);
    setIsMatchGameOver(false);
    playSound('fanfare');
  };

  // Speed Match timer countdown
  useEffect(() => {
    if (!isMatchRunning) return;
    const interval = setInterval(() => {
      setMatchTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsMatchRunning(false);
          setIsMatchGameOver(true);
          playSound('wrong');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isMatchRunning]);

  const handleCardClick = (card: MatchCard) => {
    if (!isMatchRunning || card.isMatched) return;

    if (card.isWord) {
      speakWord(card.text);
    } else {
      playSound('click');
    }

    if (!selectedMatchCard) {
      setSelectedMatchCard(card);
      return;
    }

    if (selectedMatchCard.id === card.id) {
      // Deselect
      setSelectedMatchCard(null);
      return;
    }

    // Check match
    if (selectedMatchCard.wordId === card.wordId && selectedMatchCard.isWord !== card.isWord) {
      // Success match!
      playSound('correct');
      playSound('coin');
      const addedPoints = 10 * matchCombo;
      setMatchScore((prev) => prev + addedPoints);
      setMatchCombo((prev) => Math.min(4, prev + 1));

      const updated = matchCards.map((c) =>
        c.wordId === card.wordId ? { ...c, isMatched: true } : c
      );
      setMatchCards(updated);
      setSelectedMatchCard(null);

      // Check if all matched
      if (updated.every((c) => c.isMatched)) {
        setIsMatchRunning(false);
        setIsMatchGameOver(true);
        onEarnCoins(20);
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#F97316', '#8B5CF6', '#10B981'],
        });
      }
    } else {
      // Wrong match
      playSound('wrong');
      setMatchCombo(1);
      setSelectedMatchCard(null);
    }
  };

  /* ----------------------------------------------------
     GAME 2: FILL IN THE BLANK (Cloze test)
  ---------------------------------------------------- */
  const [fillIndex, setFillIndex] = useState(0);
  const [fillSelectedWord, setFillSelectedWord] = useState<string | null>(null);
  const [fillResult, setFillResult] = useState<'correct' | 'wrong' | null>(null);

  const fillVocab = VOCABULARY_LIST[fillIndex % VOCABULARY_LIST.length];
  // Replace target word in example sentence with blank: ______
  const sentenceWithBlank = fillVocab.example.replace(
    new RegExp(fillVocab.word, 'gi'),
    '_______'
  );

  // Generate 4 multiple-choice options (1 correct, 3 decoys)
  const fillOptions = React.useMemo(() => {
    const decoys = VOCABULARY_LIST.filter((v) => v.id !== fillVocab.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map((v) => v.word);
    return [fillVocab.word, ...decoys].sort(() => Math.random() - 0.5);
  }, [fillIndex]);

  const handleSelectFillOption = (opt: string) => {
    if (fillResult) return;
    setFillSelectedWord(opt);
    if (opt.toLowerCase() === fillVocab.word.toLowerCase()) {
      setFillResult('correct');
      playSound('correct');
      playSound('coin');
      onEarnCoins(10);
    } else {
      setFillResult('wrong');
      playSound('wrong');
    }
  };

  const handleNextFill = () => {
    setFillIndex((prev) => prev + 1);
    setFillSelectedWord(null);
    setFillResult(null);
  };

  /* ----------------------------------------------------
     GAME 3: AUDIO BLITZ (Speed hearing sprint)
  ---------------------------------------------------- */
  const [blitzIndex, setBlitzIndex] = useState(0);
  const [blitzFuse, setBlitzFuse] = useState<number>(8); // 8-second fuse
  const [blitzRunning, setBlitzRunning] = useState(false);
  const [blitzScore, setBlitzScore] = useState(0);
  const [blitzResult, setBlitzResult] = useState<'correct' | 'wrong' | null>(null);

  const currentBlitzWord = VOCABULARY_LIST[blitzIndex % VOCABULARY_LIST.length];

  const blitzOptions = React.useMemo(() => {
    const decoys = VOCABULARY_LIST.filter((v) => v.id !== currentBlitzWord.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    return [currentBlitzWord, ...decoys].sort(() => Math.random() - 0.5);
  }, [blitzIndex]);

  const startAudioBlitz = () => {
    setBlitzIndex(0);
    setBlitzScore(0);
    setBlitzFuse(8);
    setBlitzResult(null);
    setBlitzRunning(true);
    speakWord(currentBlitzWord.word);
    playSound('click');
  };

  // Blitz Countdown
  useEffect(() => {
    if (!blitzRunning || blitzResult !== null) return;
    const timer = setInterval(() => {
      setBlitzFuse((prev) => {
        if (prev <= 1) {
          setBlitzResult('wrong');
          playSound('wrong');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [blitzRunning, blitzResult, blitzIndex]);

  const handleBlitzChoice = (chosen: VocabWord) => {
    if (blitzResult !== null) return;

    if (chosen.id === currentBlitzWord.id) {
      setBlitzResult('correct');
      setBlitzScore((prev) => prev + 10);
      playSound('correct');
      playSound('coin');
      onEarnCoins(10);
    } else {
      setBlitzResult('wrong');
      playSound('wrong');
    }
  };

  const handleNextBlitz = () => {
    setBlitzIndex((prev) => prev + 1);
    setBlitzFuse(8);
    setBlitzResult(null);
    setTimeout(() => {
      speakWord(VOCABULARY_LIST[(blitzIndex + 1) % VOCABULARY_LIST.length].word);
    }, 200);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header with Energetic Coral Orange & Dreamy Purple Accents */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-orange-600 mb-1">
            <span>Gamified Arena</span>
            <span>·</span>
            <span>Earn Bonus Coins</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Vocabulary Arena</h1>
          <p className="text-sm text-slate-600 mt-1">
            Test your reflexes, recall speed, and listening comprehension through 3 exciting mini-games.
          </p>
        </div>

        {/* Game Mode Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl overflow-x-auto">
          <button
            onClick={() => {
              setActiveMode('speed_match');
              playSound('click');
            }}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              activeMode === 'speed_match'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ⚡ Speed Matching
          </button>
          <button
            onClick={() => {
              setActiveMode('fill_blank');
              playSound('click');
            }}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              activeMode === 'fill_blank'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ✏️ Cloze Challenge
          </button>
          <button
            onClick={() => {
              setActiveMode('audio_blitz');
              playSound('click');
            }}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              activeMode === 'audio_blitz'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🎧 Audio Blitz
          </button>
        </div>
      </div>

      {/* ====================================================
          MODE 1: SPEED MATCHING
         ==================================================== */}
      {activeMode === 'speed_match' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs flex flex-col items-center">
          {/* Status Bar */}
          <div className="w-full flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
            <div className="flex items-center gap-4 text-xs font-semibold">
              <span className="text-orange-600">⏱️ Time: {matchTimeLeft}s</span>
              <span className="text-purple-600">✨ Combo: x{matchCombo}</span>
            </div>
            <div className="text-sm font-bold text-slate-900 tabular-nums">
              Score: {matchScore} pts
            </div>
          </div>

          {!isMatchRunning && !isMatchGameOver && (
            <div className="py-12 text-center max-w-md">
              <div className="text-4xl mb-3">⚡</div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Speed Matching</h3>
              <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                Match each English word with its Vietnamese translation before the 50-second timer runs out. Build combos to multiply points!
              </p>
              <button
                onClick={initSpeedMatchGame}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-purple-600 text-white font-semibold text-xs transition-transform hover:scale-105 active:scale-95 shadow-md cursor-pointer"
              >
                Start Game →
              </button>
            </div>
          )}

          {isMatchGameOver && (
            <div className="py-10 text-center max-w-md animate-bounce">
              <div className="text-4xl mb-2">
                {matchCards.every((c) => c.isMatched) ? '🏆' : '⏰'}
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-1">
                {matchCards.every((c) => c.isMatched) ? 'Board Cleared!' : 'Time’s Up!'}
              </h3>
              <p className="text-xs text-slate-600 mb-4">
                Final Score: <span className="font-bold text-orange-600">{matchScore} pts</span>
              </p>
              <button
                onClick={initSpeedMatchGame}
                className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                Play Again
              </button>
            </div>
          )}

          {isMatchRunning && (
            <div className="w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {matchCards.map((card) => {
                const isSelected = selectedMatchCard?.id === card.id;

                return (
                  <button
                    key={card.id}
                    disabled={card.isMatched}
                    onClick={() => handleCardClick(card)}
                    className={`h-24 p-3 rounded-2xl border text-center flex flex-col items-center justify-center transition-all cursor-pointer select-none ${
                      card.isMatched
                        ? 'opacity-20 border-emerald-300 bg-emerald-50 text-emerald-800 line-through cursor-not-allowed'
                        : isSelected
                        ? 'border-orange-500 bg-orange-50/70 text-orange-950 font-bold ring-2 ring-orange-400/40 shadow-xs'
                        : 'border-slate-200 bg-slate-50/60 hover:bg-white hover:border-slate-300 text-slate-800 font-medium'
                    }`}
                  >
                    <span className="text-[11px] text-slate-400 mb-1">
                      {card.isWord ? '🇬🇧 Word' : '🇻🇳 Nghĩa'}
                    </span>
                    <span className="text-sm font-semibold leading-tight">
                      {card.text}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ====================================================
          MODE 2: FILL IN THE BLANK (Cloze test)
         ==================================================== */}
      {activeMode === 'fill_blank' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-xs flex flex-col items-center">
          <div className="w-full flex items-center justify-between pb-4 border-b border-slate-100 mb-6 text-xs text-slate-500 font-medium">
            <span>Contextual Cloze Question #{fillIndex + 1}</span>
            <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded-md font-semibold">
              Level {fillVocab.level}
            </span>
          </div>

          {/* Sentence card */}
          <div className="w-full max-w-lg bg-slate-50/80 border border-slate-200 rounded-2xl p-6 text-center mb-8">
            <span className="text-xs uppercase font-semibold text-slate-400 block mb-2">
              Complete the sentence:
            </span>
            <p className="text-lg font-medium text-slate-900 leading-relaxed">
              "{sentenceWithBlank}"
            </p>
            <div className="mt-3 text-xs text-slate-500 italic">
              Gợi ý nghĩa: <span className="font-semibold text-purple-700">{fillVocab.vietnamese}</span>
            </div>
          </div>

          {/* 4 Choices */}
          <div className="w-full max-w-lg grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            {fillOptions.map((opt, i) => {
              const isChosen = fillSelectedWord === opt;
              const isCorrect = fillResult === 'correct' && isChosen;
              const isWrong = fillResult === 'wrong' && isChosen;

              return (
                <button
                  key={i}
                  disabled={fillResult !== null}
                  onClick={() => handleSelectFillOption(opt)}
                  className={`p-3.5 rounded-xl border text-sm font-semibold transition-all cursor-pointer text-left ${
                    isCorrect
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                      : isWrong
                      ? 'bg-rose-50 border-rose-500 text-rose-800'
                      : 'bg-white border-slate-200 hover:border-purple-300 hover:bg-purple-50/30 text-slate-800'
                  }`}
                >
                  <span className="text-slate-400 font-mono mr-2">{String.fromCharCode(65 + i)}.</span>
                  {opt}
                </button>
              );
            })}
          </div>

          {/* Result banner & Next button */}
          {fillResult && (
            <div className="w-full max-w-lg flex items-center justify-between pt-4 border-t border-slate-100">
              <span className={`text-xs font-semibold ${fillResult === 'correct' ? 'text-emerald-700' : 'text-rose-700'}`}>
                {fillResult === 'correct' ? '✓ Correct! +10 Coins awarded' : `✗ Correct answer was: "${fillVocab.word}"`}
              </span>
              <button
                onClick={handleNextFill}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold cursor-pointer"
              >
                Next Challenge →
              </button>
            </div>
          )}
        </div>
      )}

      {/* ====================================================
          MODE 3: AUDIO BLITZ (Speed hearing sprint)
         ==================================================== */}
      {activeMode === 'audio_blitz' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-xs flex flex-col items-center">
          <div className="w-full flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
            <div className="flex items-center gap-2 text-xs font-semibold text-purple-700">
              <span>🎧 Rapid Listening Sprint</span>
            </div>
            <div className="text-sm font-bold text-slate-900 tabular-nums">
              Score: {blitzScore} pts
            </div>
          </div>

          {!blitzRunning ? (
            <div className="py-12 text-center max-w-md">
              <div className="text-4xl mb-3">🎧</div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Audio Blitz</h3>
              <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                Hear the pronunciation rapidly and tap the matching definition before the 8-second fuse expires!
              </p>
              <button
                onClick={startAudioBlitz}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold text-xs transition-transform hover:scale-105 active:scale-95 shadow-md cursor-pointer"
              >
                Start Listening Blitz →
              </button>
            </div>
          ) : (
            <div className="w-full max-w-lg flex flex-col items-center">
              {/* Audio Replay Button & Fuse Bar */}
              <button
                onClick={() => speakWord(currentBlitzWord.word)}
                className="w-16 h-16 rounded-full bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center shadow-md transition-transform hover:scale-105 active:scale-95 cursor-pointer mb-3"
              >
                🔊
              </button>

              {/* Fuse Countdown Meter */}
              <div className="w-full bg-slate-100 h-2 rounded-full mb-6 overflow-hidden">
                <div
                  className="bg-purple-600 h-full transition-all duration-1000 rounded-full"
                  style={{ width: `${(blitzFuse / 8) * 100}%` }}
                />
              </div>

              <span className="text-xs text-slate-400 mb-4 font-mono">
                {blitzFuse}s remaining
              </span>

              {/* 4 Choices */}
              <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                {blitzOptions.map((v) => {
                  const isCorrectTarget = v.id === currentBlitzWord.id;
                  const isGameOver = blitzResult !== null;

                  return (
                    <button
                      key={v.id}
                      disabled={isGameOver}
                      onClick={() => handleBlitzChoice(v)}
                      className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                        isGameOver && isCorrectTarget
                          ? 'bg-emerald-50 border-emerald-400 text-emerald-900 font-semibold'
                          : 'bg-white border-slate-200 hover:border-purple-300 hover:bg-purple-50/40'
                      }`}
                    >
                      <div className="text-sm font-bold text-slate-900 mb-0.5">
                        {v.word}
                      </div>
                      <div className="text-xs text-slate-500">
                        {v.vietnamese}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Next Round */}
              {blitzResult !== null && (
                <div className="w-full flex items-center justify-between pt-4 border-t border-slate-100">
                  <span className={`text-xs font-semibold ${blitzResult === 'correct' ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {blitzResult === 'correct' ? '✓ Speed Recall Mastered! +10 Coins' : `Word was: "${currentBlitzWord.word}"`}
                  </span>
                  <button
                    onClick={handleNextBlitz}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Next Audio Sprint →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
