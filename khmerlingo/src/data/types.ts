export type ExerciseType = 'SELECT' | 'ASSIST' | 'MATCH' | 'FILL_BLANK';

export interface VocabItem {
  id: string;
  khmer: string;           // Unicode Khmer script
  english: string;          // English translation
  romanized: string;        // Pronunciation guide (romanization)
  partOfSpeech: 'noun' | 'verb' | 'adjective' | 'adverb' | 'phrase' | 'numeral' | 'consonant' | 'vowel';
  exampleKhmer?: string;    // Example sentence in Khmer
  exampleEnglish?: string;  // Example sentence in English
  imageEmoji?: string;      // Emoji visual cue
}

export interface ChallengeOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface Challenge {
  id: string;
  type: ExerciseType;
  questionText: string;          // What to display as question
  questionKhmer?: string;        // Khmer question text if applicable
  correctAnswer: string;         // The correct answer
  options: ChallengeOption[];    // All answer options (4 for SELECT/ASSIST, more for MATCH)
  hint?: string;                 // Optional hint
  vocabId: string;               // Links to VocabItem
}

export interface Module {
  id: string;
  title: string;                 // English title
  titleKhmer: string;            // Khmer title
  description: string;
  icon: string;                  // Emoji icon
  color: string;                 // Tailwind color class (e.g., 'bg-green-500')
  borderColor: string;           // Tailwind border class
  order: number;                 // Position in skill tree
  vocabulary: VocabItem[];
  challenges: Challenge[];
}

export type QuizStatus = 'none' | 'correct' | 'wrong' | 'completed';

export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: string;
}

export const BADGES: BadgeDefinition[] = [
  { id: 'first-lesson', name: 'First Steps', description: 'Complete your first lesson', icon: '🌟', condition: 'Complete 1 module' },
  { id: 'greeter', name: 'Friendly Greeter', description: 'Master Khmer greetings', icon: '👋', condition: 'Complete Greetings module' },
  { id: 'counter', name: 'Number Cruncher', description: 'Learn to count in Khmer', icon: '🔢', condition: 'Complete Numbers module' },
  { id: 'alphabet', name: 'Alphabet Master', description: 'Learn the Khmer alphabet', icon: '📚', condition: 'Complete Alphabet module' },
  { id: 'foodie', name: 'Cambodian Foodie', description: 'Know your Khmer foods', icon: '🍜', condition: 'Complete Food module' },
  { id: 'family', name: 'Family Values', description: 'Know Khmer family terms', icon: '👨‍👩‍👧', condition: 'Complete Family module' },
  { id: 'streak-3', name: '3-Day Streak', description: '3 days in a row!', icon: '🔥', condition: '3 day streak' },
  { id: 'streak-7', name: 'Week Warrior', description: '7-day streak!', icon: '⚡', condition: '7 day streak' },
  { id: 'graduate', name: 'Khmer Graduate', description: 'Complete all 10 modules', icon: '🎓', condition: 'Complete all modules' },
];
