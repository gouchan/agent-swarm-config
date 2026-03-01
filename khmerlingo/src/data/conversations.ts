/**
 * Pre-built conversation scenarios for practice mode.
 * Each scenario is a dialogue tree with expected user responses graded via fuzzy matching.
 */

export interface ConversationTurn {
  /** Who is speaking — 'bot' for the Khmer speaker, 'user' for the learner */
  speaker: "bot" | "user";
  /** The Khmer text the bot says, or the prompt for the user */
  khmer: string;
  /** English translation / prompt */
  english: string;
  /** Romanized pronunciation guide */
  romanized: string;
  /** For user turns: accepted correct answers (Khmer) */
  acceptedAnswers?: string[];
  /** Hint shown if user struggles */
  hint?: string;
}

export interface ConversationScenario {
  id: string;
  title: string;
  titleKhmer: string;
  description: string;
  icon: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  xpReward: number;
  turns: ConversationTurn[];
}

export const conversations: ConversationScenario[] = [
  {
    id: "market-shopping",
    title: "At the Market",
    titleKhmer: "នៅផ្សារ",
    description: "Practice buying food at a Cambodian market",
    icon: "🏪",
    difficulty: "beginner",
    xpReward: 30,
    turns: [
      {
        speaker: "bot",
        khmer: "សួស្តី! តើអ្នកចង់ទិញអ្វី?",
        english: "Hello! What would you like to buy?",
        romanized: "suos sdei! tae nak jong tinh avei?",
      },
      {
        speaker: "user",
        khmer: "ជំរាបសួរ",
        english: "Say hello (formal)",
        romanized: "jum reap sour",
        acceptedAnswers: ["ជំរាបសួរ", "សួស្តី"],
        hint: "jum reap sour or suos sdei",
      },
      {
        speaker: "bot",
        khmer: "យើងមានផ្លែឈើ បន្លែ និងបាយ។ តើអ្នកចង់បានអ្វី?",
        english: "We have fruits, vegetables, and rice. What do you want?",
        romanized: "yeung mean plae cheu, bonlae, ning baay. tae nak jong baan avei?",
      },
      {
        speaker: "user",
        khmer: "ខ្ញុំចង់ទិញបាយ",
        english: "Say: I want to buy rice",
        romanized: "knyom jong tinh baay",
        acceptedAnswers: ["ខ្ញុំចង់ទិញបាយ", "ខ្ញុំចង់បានបាយ", "បាយ"],
        hint: "knyom jong tinh baay",
      },
      {
        speaker: "bot",
        khmer: "បាទ! មួយគីឡូ ប្រាំពាន់រៀល។",
        english: "Sure! One kilo is 5,000 riel.",
        romanized: "baat! muoy kilo pram poan riel.",
      },
      {
        speaker: "user",
        khmer: "អរគុណ",
        english: "Say thank you",
        romanized: "or kun",
        acceptedAnswers: ["អរគុណ", "អរគុណច្រើន"],
        hint: "or kun",
      },
      {
        speaker: "bot",
        khmer: "អរគុណផងដែរ! ជំរាបលា!",
        english: "Thank you too! Goodbye!",
        romanized: "or kun phong dae! jum reap lea!",
      },
    ],
  },
  {
    id: "meeting-friend",
    title: "Meeting a Friend",
    titleKhmer: "ជួបមិត្តភក្តិ",
    description: "Greet a friend and have a simple conversation",
    icon: "👋",
    difficulty: "beginner",
    xpReward: 25,
    turns: [
      {
        speaker: "bot",
        khmer: "សួស្តី! សុខសប្បាយជាទេ?",
        english: "Hello! How are you?",
        romanized: "suos sdei! sok sabbaay jea tee?",
      },
      {
        speaker: "user",
        khmer: "សួស្តី",
        english: "Say hello (informal)",
        romanized: "suos sdei",
        acceptedAnswers: ["សួស្តី", "ជំរាបសួរ"],
        hint: "suos sdei",
      },
      {
        speaker: "bot",
        khmer: "តើអ្នកសុខសប្បាយជាទេ?",
        english: "Are you doing well?",
        romanized: "tae nak sok sabbaay jea tee?",
      },
      {
        speaker: "user",
        khmer: "ខ្ញុំស្រួល អរគុណ",
        english: "Say: I'm fine, thank you",
        romanized: "knyom sruol, or kun",
        acceptedAnswers: ["ខ្ញុំស្រួល អរគុណ", "ខ្ញុំស្រួល", "ស្រួល អរគុណ", "ស្រួល"],
        hint: "knyom sruol, or kun",
      },
      {
        speaker: "bot",
        khmer: "ល្អណាស់! ខ្ញុំក៏ស្រួលដែរ។",
        english: "Great! I'm also fine.",
        romanized: "la-or nah! knyom kor sruol dae.",
      },
      {
        speaker: "user",
        khmer: "ជំរាបលា",
        english: "Say goodbye (formal)",
        romanized: "jum reap lea",
        acceptedAnswers: ["ជំរាបលា", "លាហើយ"],
        hint: "jum reap lea or lea haoy",
      },
    ],
  },
  {
    id: "restaurant-order",
    title: "Ordering Food",
    titleKhmer: "បញ្ជាទិញម្ហូប",
    description: "Order a meal at a Cambodian restaurant",
    icon: "🍜",
    difficulty: "intermediate",
    xpReward: 40,
    turns: [
      {
        speaker: "bot",
        khmer: "សូមស្វាគមន៍! តើអ្នកចង់ញ៉ាំអ្វី?",
        english: "Welcome! What would you like to eat?",
        romanized: "soum svaakom! tae nak jong nyam avei?",
      },
      {
        speaker: "user",
        khmer: "សួស្តី សូមឲ្យមី",
        english: "Say: Hello, please give me noodles",
        romanized: "suos sdei, soum aoy mee",
        acceptedAnswers: ["សួស្តី សូមឲ្យមី", "សូមឲ្យមី", "ខ្ញុំចង់ញ៉ាំមី"],
        hint: "suos sdei, soum aoy mee",
      },
      {
        speaker: "bot",
        khmer: "បាទ មីឆា ឬ គុយទាវ?",
        english: "Sure, fried noodles or noodle soup?",
        romanized: "baat, mee chaa reu kuy teav?",
      },
      {
        speaker: "user",
        khmer: "គុយទាវ សូម",
        english: "Say: Noodle soup, please",
        romanized: "kuy teav, soum",
        acceptedAnswers: ["គុយទាវ សូម", "គុយទាវ", "សូមឲ្យគុយទាវ"],
        hint: "kuy teav, soum",
      },
      {
        speaker: "bot",
        khmer: "ល្អណាស់! តើអ្នកចង់ផឹកអ្វី?",
        english: "Great! What would you like to drink?",
        romanized: "la-or nah! tae nak jong phek avei?",
      },
      {
        speaker: "user",
        khmer: "ទឹក សូម",
        english: "Say: Water, please",
        romanized: "tuk, soum",
        acceptedAnswers: ["ទឹក សូម", "ទឹក", "សូមឲ្យទឹក"],
        hint: "tuk, soum",
      },
      {
        speaker: "bot",
        khmer: "បាទ! គុយទាវ និង ទឹក។ អរគុណ!",
        english: "Sure! Noodle soup and water. Thank you!",
        romanized: "baat! kuy teav ning tuk. or kun!",
      },
      {
        speaker: "user",
        khmer: "អរគុណ",
        english: "Say thank you",
        romanized: "or kun",
        acceptedAnswers: ["អរគុណ", "អរគុណច្រើន"],
        hint: "or kun",
      },
    ],
  },
];

export function getConversationById(id: string): ConversationScenario | undefined {
  return conversations.find((c) => c.id === id);
}
