import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { VOCABULARY_LIST } from '../../data/vocabData';
import { VocabWord, CEFRLevel, WordStatus } from '../../types';
import { speakWord, playSound } from '../../lib/audio';

interface FlashcardDeckProps {
  wordProgress: Record<string, WordStatus>;
  onUpdateWordStatus: (wordId: string, status: WordStatus) => void;
  onEarnCoins: (amount: number) => void;
}

export const FlashcardDeck: React.FC<FlashcardDeckProps> = ({
  wordProgress,
  onUpdateWordStatus,
  onEarnCoins,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<CEFRLevel | 'All'>('All');
  const [selectedTopic, setSelectedTopic] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [speechRate, setSpeechRate] = useState<number>(1.0);

  // Extract unique topics
  const topics = ['All', ...Array.from(new Set(VOCABULARY_LIST.map((w) => w.topic)))];

  // Filter words
  const filteredWords = VOCABULARY_LIST.filter((w) => {
    const matchLevel = selectedLevel === 'All' || w.level === selectedLevel;
    const matchTopic = selectedTopic === 'All' || w.topic === selectedTopic;
    const matchQuery =
      searchQuery.trim() === '' ||
      w.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.vietnamese.toLowerCase().includes(searchQuery.toLowerCase());
    return matchLevel && matchTopic && matchQuery;
  });

  const activeWord: VocabWord | undefined = filteredWords[currentIndex] || filteredWords[0];
  const activeStatus: WordStatus = activeWord ? wordProgress[activeWord.id] || 'new' : 'new';

  const masteredCount = Object.values(wordProgress).filter((s) => s === 'mastered').length;
  const learningCount = Object.values(wordProgress).filter((s) => s === 'learning').length;

  const handleNext = () => {
    setIsFlipped(false);
    playSound('flip');
    setCurrentIndex((prev) => (prev + 1) % Math.max(1, filteredWords.length));
  };

  const handlePrev = () => {
    setIsFlipped(false);
    playSound('flip');
    setCurrentIndex((prev) => (prev - 1 + filteredWords.length) % Math.max(1, filteredWords.length));
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    playSound('flip');
  };

  const handlePlayAudio = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!activeWord) return;
    speakWord(activeWord.word, speechRate);
    playSound('click');
  };

  const handleSetStatus = (status: WordStatus) => {
    if (!activeWord) return;
    const previous = wordProgress[activeWord.id] || 'new';
    onUpdateWordStatus(activeWord.id, status);

    if (status === 'mastered' && previous !== 'mastered') {
      onEarnCoins(5);
      playSound('coin');
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#10B981', '#34D399', '#FBBF24'],
      });
    } else {
      playSound('correct');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Module Banner with Mint Green Accent */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-800 mb-1">
            <span>Core Module</span>
            <span>·</span>
            <span>Semantic Flashcards</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Vocabulary Flashcards</h1>
          <p className="text-sm text-slate-600 mt-1">
            Tap cards to flip between IPA phonetics, definitions, and Vietnamese translations.
          </p>
        </div>

        {/* Learning Stats */}
        <div className="flex items-center gap-3 bg-emerald-50/70 border border-emerald-100 rounded-2xl px-5 py-3">
          <div className="text-xs">
            <span className="text-emerald-900 font-semibold tabular-nums">{masteredCount}</span>
            <span className="text-emerald-700 ml-1">Mastered</span>
          </div>
          <span className="text-emerald-300">|</span>
          <div className="text-xs">
            <span className="text-amber-800 font-semibold tabular-nums">{learningCount}</span>
            <span className="text-amber-700 ml-1">Learning</span>
          </div>
          <span className="text-emerald-300">|</span>
          <div className="text-xs text-slate-500">
            <span className="font-semibold text-slate-700 tabular-nums">{VOCABULARY_LIST.length}</span> Total
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 mb-6 shadow-xs flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        {/* CEFR Level Segmented Buttons */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl overflow-x-auto">
          {(['All', 'A1', 'A2', 'B1'] as (CEFRLevel | 'All')[]).map((lvl) => (
            <button
              key={lvl}
              onClick={() => {
                setSelectedLevel(lvl);
                setCurrentIndex(0);
                setIsFlipped(false);
                playSound('click');
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                selectedLevel === lvl
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {lvl === 'All' ? 'All Levels' : `Level ${lvl}`}
            </button>
          ))}
        </div>

        {/* Topic Dropdown and Search Input */}
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <select
            value={selectedTopic}
            onChange={(e) => {
              setSelectedTopic(e.target.value);
              setCurrentIndex(0);
              setIsFlipped(false);
            }}
            className="text-xs border border-slate-200 rounded-xl px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            {topics.map((t) => (
              <option key={t} value={t}>
                {t === 'All' ? 'All Topics' : t}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Search word or nghĩa..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentIndex(0);
              setIsFlipped(false);
            }}
            className="flex-1 text-xs border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>
      </div>

      {/* Flashcard Area */}
      {filteredWords.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200/80">
          <p className="text-slate-500 text-sm">No vocabulary items match your filter criteria.</p>
          <button
            onClick={() => {
              setSelectedLevel('All');
              setSelectedTopic('All');
              setSearchQuery('');
            }}
            className="mt-4 px-4 py-2 text-xs font-semibold bg-emerald-600 text-white rounded-xl cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
      ) : activeWord ? (
        <div className="flex flex-col items-center">
          {/* Card Container with 3D Flip */}
          <div
            onClick={handleFlip}
            className="w-full max-w-xl min-h-[27rem] h-[28rem] perspective-1000 cursor-pointer select-none group"
          >
            <div
              className={`relative w-full h-full duration-500 transform-style-3d transition-transform ${
                isFlipped ? 'rotate-y-180' : ''
              }`}
            >
              {/* FRONT FACE */}
              <div className="absolute inset-0 backface-hidden bg-[#E6F4EA] border border-emerald-200/80 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-sm">
                {/* Card Topline Metadata */}
                <div className="flex items-center justify-between text-xs text-emerald-800 font-medium">
                  <div className="flex items-center gap-2">
                    <span className="font-bold uppercase tracking-wider">{activeWord.level}</span>
                    <span>·</span>
                    <span>{activeWord.topic}</span>
                    <span>·</span>
                    <span className="italic">{activeWord.partOfSpeech}</span>
                  </div>

                  <span className="text-emerald-700/80 tabular-nums text-[11px]">
                    Card {currentIndex + 1} of {filteredWords.length}
                  </span>
                </div>

                {/* Center Word, Pronunciation & English Definition */}
                <div className="text-center my-auto flex flex-col items-center">
                  <h2 className="text-4xl md:text-5xl font-extrabold text-[#137333] tracking-tight mb-1">
                    {activeWord.word}
                  </h2>
                  <div className="text-base font-mono text-emerald-800/90 mb-3">
                    {activeWord.ipa}
                  </div>

                  {/* English Definition blending seamlessly into the flashcard */}
                  <div className="w-full max-w-lg mb-5 text-center px-4">
                    <p className="text-base sm:text-lg text-emerald-950/90 leading-relaxed font-medium">
                      "{activeWord.definition}"
                    </p>
                  </div>

                  {/* Audio Play Button */}
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={handlePlayAudio}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#137333] text-white hover:bg-[#0f5c29] text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                      </svg>
                      <span>Listen Pronunciation</span>
                    </button>

                    {/* Speech Speed Switcher */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const nextRate = speechRate === 1.0 ? 0.7 : 1.0;
                        setSpeechRate(nextRate);
                        speakWord(activeWord.word, nextRate);
                      }}
                      className="px-3 py-2 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-semibold hover:bg-emerald-200 transition-colors cursor-pointer"
                    >
                      {speechRate === 1.0 ? '1.0x' : '0.7x (Slow)'}
                    </button>
                  </div>
                </div>

                {/* Flip Prompt Footer */}
                <div className="text-center text-xs text-emerald-700/80 font-medium">
                  Tap card to flip for Vietnamese translation & collocations ↷
                </div>
              </div>

              {/* BACK FACE */}
              <div className="absolute inset-0 backface-hidden rotate-y-180 bg-white border border-emerald-300 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-sm">
                <div>
                  {/* Back Topline */}
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-4 pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-emerald-700">{activeWord.word}</span>
                      <span className="font-mono text-slate-400">{activeWord.ipa}</span>
                    </div>
                    <button
                      onClick={handlePlayAudio}
                      className="text-emerald-700 hover:text-emerald-800 text-xs font-semibold cursor-pointer flex items-center gap-1"
                    >
                      <span>🔊 Replay</span>
                    </button>
                  </div>

                  {/* Vietnamese Meaning Banner */}
                  <div className="mb-4 p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100">
                    <span className="text-[11px] uppercase font-bold tracking-wider text-emerald-800 block mb-1">
                      Nghĩa tiếng Việt
                    </span>
                    <p className="text-2xl font-bold text-slate-900 leading-snug">
                      {activeWord.vietnamese}
                    </p>
                  </div>

                  {/* Collocations */}
                  <div className="mb-4">
                    <span className="text-xs uppercase font-semibold text-slate-400 block mb-1">
                      Frequent Collocations
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {activeWord.collocations.map((col, idx) => (
                        <span
                          key={idx}
                          className="text-xs px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 font-medium border border-emerald-100"
                        >
                          {col}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Example Sentence */}
                  <div>
                    <span className="text-xs uppercase font-semibold text-slate-400 block mb-1">
                      Example
                    </span>
                    <p className="text-xs italic text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      "{activeWord.example}"
                    </p>
                  </div>
                </div>

                {/* Flip back hint */}
                <div className="text-center text-[11px] text-slate-400 pt-2">
                  Tap to flip back to front
                </div>
              </div>
            </div>
          </div>

          {/* Controls Below Card: Prev/Next & Mastery Buttons */}
          <div className="w-full max-w-xl mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Prev / Next Navigation */}
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrev}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
              >
                ← Previous
              </button>
              <button
                onClick={handleNext}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
              >
                Next →
              </button>
            </div>

            {/* Mastery Status Selector */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleSetStatus('learning')}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                  activeStatus === 'learning'
                    ? 'bg-amber-100 text-amber-800 border border-amber-300 font-semibold'
                    : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                Mark Learning
              </button>
              <button
                onClick={() => handleSetStatus('mastered')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeStatus === 'mastered'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                }`}
              >
                <span>{activeStatus === 'mastered' ? '✓ Mastered' : 'Master (+5 🪙)'}</span>
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
