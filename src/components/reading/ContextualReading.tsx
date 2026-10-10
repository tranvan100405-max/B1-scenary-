import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { READING_STORIES } from '../../data/storiesData';
import { VOCABULARY_LIST } from '../../data/vocabData';
import { ReadingStory, VocabWord } from '../../types';
import { speakWord, playSound } from '../../lib/audio';

interface ContextualReadingProps {
  onEarnCoins: (amount: number) => void;
}

export const ContextualReading: React.FC<ContextualReadingProps> = ({ onEarnCoins }) => {
  const [selectedStoryId, setSelectedStoryId] = useState<string>(READING_STORIES[0].id);
  const [inspectedWord, setInspectedWord] = useState<VocabWord | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [isQuizSubmitted, setIsQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  const activeStory: ReadingStory =
    READING_STORIES.find((s) => s.id === selectedStoryId) || READING_STORIES[0];

  // Map target words for quick lookup
  const targetWordsMap = new Map<string, VocabWord>();
  VOCABULARY_LIST.forEach((w) => {
    targetWordsMap.set(w.word.toLowerCase(), w);
  });

  const handleSelectStory = (id: string) => {
    setSelectedStoryId(id);
    setInspectedWord(null);
    setUserAnswers({});
    setIsQuizSubmitted(false);
    setQuizScore(0);
    playSound('click');
  };

  const handleWordClick = (wordClean: string) => {
    const vocab = targetWordsMap.get(wordClean.toLowerCase());
    if (vocab) {
      setInspectedWord(vocab);
      speakWord(vocab.word);
      playSound('click');
    }
  };

  const handleAnswerSelect = (qIdx: number, optIdx: number) => {
    if (isQuizSubmitted) return;
    setUserAnswers((prev) => ({ ...prev, [qIdx]: optIdx }));
    playSound('click');
  };

  const handleSubmitQuiz = () => {
    let score = 0;
    activeStory.questions.forEach((q, idx) => {
      if (userAnswers[idx] === q.correctIndex) {
        score++;
      }
    });

    setQuizScore(score);
    setIsQuizSubmitted(true);

    if (score >= 2) {
      playSound('fanfare');
      playSound('coin');
      onEarnCoins(15);
      confetti({
        particleCount: 70,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#D97706', '#F59E0B', '#10B981'],
      });
    } else {
      playSound('wrong');
    }
  };

  // Render text with interactive word highlights
  const renderInteractiveStoryText = (text: string) => {
    const paragraphs = text.split('\n\n');

    return paragraphs.map((para, pIdx) => {
      // Split words while preserving punctuation
      const tokens = para.split(/(\s+|[.,!?"'“”]+)/);

      return (
        <p key={pIdx} className="mb-4 leading-relaxed text-slate-800 text-base">
          {tokens.map((token, tIdx) => {
            const clean = token.toLowerCase().replace(/[^a-z]/g, '');
            const isTarget = targetWordsMap.has(clean) && activeStory.targetWordIds.includes(targetWordsMap.get(clean)!.id);

            if (isTarget) {
              const vocab = targetWordsMap.get(clean)!;
              const isInspected = inspectedWord?.id === vocab.id;

              return (
                <button
                  key={tIdx}
                  type="button"
                  onClick={() => handleWordClick(clean)}
                  className={`inline px-1.5 py-0.5 rounded font-semibold text-[#D97706] bg-[#FEF3C7] hover:bg-amber-200 transition-colors cursor-pointer ${
                    isInspected ? 'ring-2 ring-amber-400 font-bold' : ''
                  }`}
                  title={`Click to inspect: ${vocab.vietnamese}`}
                >
                  {token}
                </button>
              );
            }

            return <span key={tIdx}>{token}</span>;
          })}
        </p>
      );
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Module Title with Warm Paper Yellow Accent */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-800 mb-1">
            <span>Contextual Reading</span>
            <span>·</span>
            <span>Graded Stories A1–B1</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Story Reader</h1>
          <p className="text-sm text-slate-600 mt-1">
            Read engaging short stories. Tap highlighted words for definitions, pronunciation, and take the comprehension quiz.
          </p>
        </div>

        {/* Story Selector Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl overflow-x-auto">
          {READING_STORIES.map((s) => (
            <button
              key={s.id}
              onClick={() => handleSelectStory(s.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                selectedStoryId === s.id
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="font-semibold text-amber-700 mr-1.5">{s.level}</span>
              <span>{s.title.split(' ')[0]} {s.title.split(' ')[1]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Story Book (Left) + Word Inspector (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Story Book & Comprehension Quiz */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Story Container (Warm Paper Yellow Aesthetic) */}
          <div className="bg-[#FFFDF5] rounded-3xl border border-amber-200/80 p-8 shadow-xs">
            {/* Story Header */}
            <div className="flex items-center justify-between text-xs text-amber-900/70 mb-3 font-medium">
              <div className="flex items-center gap-2">
                <span className="bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-md">
                  Level {activeStory.level}
                </span>
                <span>·</span>
                <span>{activeStory.topic}</span>
                <span>·</span>
                <span>{activeStory.readTime}</span>
              </div>
            </div>

            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
              {activeStory.title}
            </h2>

            {/* Bilingual summary */}
            <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-100 mb-6 text-xs text-amber-900">
              <span className="font-semibold mr-1">Tóm tắt:</span>
              <span>{activeStory.vietnameseSummary}</span>
            </div>

            {/* Story Content with Interactive Highlights */}
            <div className="border-t border-amber-100 pt-6">
              {renderInteractiveStoryText(activeStory.content)}
            </div>
          </div>

          {/* Comprehension Quiz Card */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Comprehension Micro-Quiz</h3>
                <p className="text-xs text-slate-500">
                  Answer 3 quick questions about the story to earn +15 Coins!
                </p>
              </div>
              {isQuizSubmitted && (
                <div className="text-right">
                  <div className="text-xs font-semibold text-amber-600">Quiz Score</div>
                  <div className="text-lg font-bold text-slate-900 tabular-nums">
                    {quizScore} / {activeStory.questions.length}
                  </div>
                </div>
              )}
            </div>

            {/* Questions list */}
            <div className="space-y-6">
              {activeStory.questions.map((q, qIdx) => (
                <div key={qIdx} className="space-y-2">
                  <p className="text-sm font-semibold text-slate-900">
                    {qIdx + 1}. {q.question}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {q.options.map((opt, optIdx) => {
                      const isSelected = userAnswers[qIdx] === optIdx;
                      const isCorrect = isQuizSubmitted && optIdx === q.correctIndex;
                      const isWrong = isQuizSubmitted && isSelected && optIdx !== q.correctIndex;

                      return (
                        <button
                          key={optIdx}
                          type="button"
                          onClick={() => handleAnswerSelect(qIdx, optIdx)}
                          className={`p-3 rounded-xl text-left text-xs transition-all cursor-pointer border ${
                            isCorrect
                              ? 'bg-emerald-50 border-emerald-400 text-emerald-800 font-semibold'
                              : isWrong
                              ? 'bg-rose-50 border-rose-400 text-rose-800'
                              : isSelected
                              ? 'bg-amber-50 border-amber-400 text-amber-900 font-medium'
                              : 'bg-slate-50/60 border-slate-200/80 hover:bg-slate-100 text-slate-700'
                          }`}
                        >
                          <span className="font-mono text-slate-400 mr-2">
                            {String.fromCharCode(65 + optIdx)}.
                          </span>
                          {opt}
                        </button>
                      );
                    })}
                  </div>

                  {isQuizSubmitted && (
                    <p className="text-xs text-slate-500 bg-slate-50 p-2 rounded-lg mt-1 italic">
                      💡 {q.explanation}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Quiz Submit Button */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              {!isQuizSubmitted ? (
                <button
                  type="button"
                  onClick={handleSubmitQuiz}
                  disabled={Object.keys(userAnswers).length < activeStory.questions.length}
                  className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs transition-colors shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit Quiz Answers
                </button>
              ) : (
                <div className="flex items-center gap-3">
                  <span className="text-xs text-emerald-700 font-semibold">
                    {quizScore >= 2 ? '🎉 Great reading comprehension! +15 Coins awarded' : 'Keep practicing! Review the story text and try again.'}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setUserAnswers({});
                      setIsQuizSubmitted(false);
                      setQuizScore(0);
                    }}
                    className="text-xs text-amber-700 hover:text-amber-800 font-semibold cursor-pointer underline"
                  >
                    Retake Quiz
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Vocabulary Inspector Drawer */}
        <div className="lg:col-span-4 sticky top-6">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Word Inspector
              </span>
              <span className="text-[11px] text-amber-700 font-medium">
                Tap words in text 👆
              </span>
            </div>

            {inspectedWord ? (
              <div>
                {/* Word and Audio Replay */}
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-2xl font-bold text-slate-900">
                    {inspectedWord.word}
                  </h3>
                  <button
                    onClick={() => speakWord(inspectedWord.word)}
                    className="p-2 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-800 transition-colors cursor-pointer"
                    title="Listen pronunciation"
                  >
                    🔊
                  </button>
                </div>

                <div className="font-mono text-sm text-slate-500 mb-4">
                  {inspectedWord.ipa} · <span className="italic">{inspectedWord.partOfSpeech}</span>
                </div>

                {/* Vietnamese Meaning */}
                <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-100">
                  <span className="text-[11px] font-semibold uppercase text-amber-800 block mb-0.5">
                    Nghĩa Tiếng Việt
                  </span>
                  <p className="text-base font-bold text-slate-900">
                    {inspectedWord.vietnamese}
                  </p>
                </div>

                {/* English Definition */}
                <div className="mb-4">
                  <span className="text-[11px] font-semibold uppercase text-slate-400 block mb-0.5">
                    English Definition
                  </span>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {inspectedWord.definition}
                  </p>
                </div>

                {/* Collocations */}
                <div>
                  <span className="text-[11px] font-semibold uppercase text-slate-400 block mb-1">
                    Common Collocations
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {inspectedWord.collocations.map((c, i) => (
                      <span
                        key={i}
                        className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400">
                <div className="text-3xl mb-2">📖</div>
                <p className="text-xs">
                  Tap any highlighted yellow word in the story to see its pronunciation, IPA, and Vietnamese translation!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
