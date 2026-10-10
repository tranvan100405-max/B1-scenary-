export type CEFRLevel = 'A1' | 'A2' | 'B1';

export type WordStatus = 'new' | 'learning' | 'mastered';

export interface VocabWord {
  id: string;
  word: string;
  ipa: string;
  level: CEFRLevel;
  topic: string;
  partOfSpeech: string;
  definition: string;
  vietnamese: string;
  example: string;
  collocations: string[];
}

export interface WordProgress {
  wordId: string;
  status: WordStatus;
  reviewCount: number;
  lastReviewedAt: string;
}

export type OutfitCategory = 'Fun & Cute' | 'Smart & Academic' | 'Adventurer';

export interface MascotOutfit {
  id: string;
  name: string;
  category: OutfitCategory;
  price: number;
  description: string;
  features: string[];
  themeColor: string;
  tagline: string;
}

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  isGuest?: boolean;
  coins: number;
  streak: number;
  lastActiveDate: string;
  equippedOutfit: string;
  unlockedOutfits: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ComprehensionQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface ReadingStory {
  id: string;
  title: string;
  level: CEFRLevel;
  topic: string;
  readTime: string;
  summary: string;
  vietnameseSummary: string;
  content: string;
  targetWordIds: string[];
  questions: ComprehensionQuestion[];
}

export interface QuizHistoryRecord {
  id: string;
  gameType: 'speed_match' | 'fill_blank' | 'audio_blitz' | 'reading_comprehension' | 'dictation';
  score: number;
  coinsEarned: number;
  completedAt: string;
}
