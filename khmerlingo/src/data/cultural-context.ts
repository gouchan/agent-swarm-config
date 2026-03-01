// Cultural context and learning aids for KhmerLingo vocabulary
// Keyed by vocab ID matching src/data/modules.ts

export interface VocabContext {
  culturalNote: string;    // 1-2 sentences of cultural/linguistic insight
  mnemonic: string;        // Memory trick to remember the word
  charBreakdown?: string;  // What the Khmer characters mean (for compound words)
  funFact?: string;        // Optional surprising fact
  wrongAnswerTips?: Record<string, string>; // Common confusions: "don't confuse with..."
}

export const culturalContext: Record<string, VocabContext> = {

  // ─────────────────────────────────────────────────────────────────────────
  // MODULE 1: Greetings (greet-1 through greet-12)
  // ─────────────────────────────────────────────────────────────────────────

  'greet-1': {
    culturalNote: "ជំរាបសួរ is used with hands pressed together in the 'sampeah' gesture (a prayer-like bow). It literally contains ជំរាប meaning 'to inform or address respectfully', reflecting the deeply hierarchical nature of formal Cambodian greetings.",
    mnemonic: "JUM-REAP-SOUR: 'Jumping to REAP the SOUR grapes' -- formal and a bit stiff, just like formal greetings!",
    charBreakdown: "ជំរាប (to inform/address respectfully) + សួរ (to ask/inquire) = formally asking how someone is",
    funFact: "The height of your sampeah bow indicates the level of respect: hands at chest for equals, at the nose for elders, at the forehead for monks and royalty.",
    wrongAnswerTips: {
      'greet-3': "Don't confuse with ជំរាបលា -- both start with ជំរាប, but សួរ means 'ask/greet' while លា means 'leave/farewell'.",
    },
  },

  'greet-2': {
    culturalNote: "សួស្តី is borrowed from the Sanskrit/Pali word 'svasti' meaning wellbeing or auspiciousness. It's used casually among friends and peers, much like 'hi' in English, and is increasingly popular among younger Cambodians.",
    mnemonic: "SUOS SDEI sounds like 'So! Stay!' -- a casual, friendly 'hey, stick around!'",
    charBreakdown: "សួស្តី is a single loanword from Sanskrit svasti (wellbeing/good fortune)",
    wrongAnswerTips: {
      'greet-1': "ជំរាបសួរ is the formal version; សួស្តី is informal. Think: short word = casual, long word = formal.",
    },
  },

  'greet-3': {
    culturalNote: "ជំរាបលា is the formal farewell, used with the same sampeah gesture as the formal hello. In Cambodian culture, proper farewells are considered just as important as greetings, reflecting respect for the relationship.",
    mnemonic: "JUM-REAP-LEA: The formal greeting but ending with LEA(ve) -- you're LEAving formally!",
    charBreakdown: "ជំរាប (to inform/address) + លា (to leave/say farewell) = formally announcing your departure",
    wrongAnswerTips: {
      'greet-1': "Both start with ជំរាប but end differently: សួរ = greeting (arriving), លា = farewell (leaving).",
    },
  },

  'greet-4': {
    culturalNote: "លាហើយ is the casual goodbye used with friends, family, and people of similar status. The word ហើយ means 'already/done', giving this phrase a breezy 'farewell, it's done' feel -- like the English 'later!'.",
    mnemonic: "LEA HAOY: 'LEAve, it's HOWDY time elsewhere!' -- a quick casual bye.",
    charBreakdown: "លា (to leave/farewell) + ហើយ (already/finished) = farewell, we're done here",
  },

  'greet-5': {
    culturalNote: "អរគុណ comes from the Pali word for merit or virtue. Thanking someone in Khmer literally references the Buddhist concept of merit-making, connecting everyday politeness to spiritual gratitude.",
    mnemonic: "OR-KUN: 'Or could you' accept my thanks? OR KUN(d) you be more grateful?",
    charBreakdown: "អរ (to rejoice/be glad) + គុណ (virtue/merit) = rejoicing in someone's virtue/kindness",
    funFact: "To make it more emphatic, Cambodians say អរគុណច្រើន (or kun chraen) meaning 'thank you much', similar to how 'merci beaucoup' works in French.",
  },

  'greet-6': {
    culturalNote: "សូមទោស literally means 'please (give me the) punishment', reflecting a deeply humble approach to apology in Khmer culture. It can mean both 'sorry' and 'excuse me', used to get attention politely or to apologize.",
    mnemonic: "SOUM TOAH: 'So, um... TOE-Ah, I stepped on your toe! Sorry!'",
    charBreakdown: "សូម (please/to request) + ទោស (punishment/fault) = requesting forgiveness for a fault",
    wrongAnswerTips: {
      'greet-10': "សូម alone means 'please'. សូមទោស adds ទោស (fault/punishment) to mean 'sorry'.",
    },
  },

  'greet-7': {
    culturalNote: "បាទ is exclusively used by male speakers to say 'yes' in polite speech. Khmer is one of several Southeast Asian languages with gender-specific politeness particles, reflecting how social identity shapes everyday language.",
    mnemonic: "BAAT: A man tips his BAt (hat) -- 'Yes sir, BAAT!'",
    funFact: "Using the wrong gendered 'yes' (បាទ for women or ចាស for men) is a common and amusing mistake foreigners make. Cambodians will usually laugh warmly and correct you.",
    wrongAnswerTips: {
      'greet-8': "បាទ (baat) = male 'yes'; ចាស (chas) = female 'yes'. Remember: Baat for Boys.",
    },
  },

  'greet-8': {
    culturalNote: "ចាស is the polite female affirmative in Khmer. Women use it in the same contexts men would use បាទ. In modern Cambodia, these gender distinctions remain strong in formal and polite speech, though casual speech among young people is more relaxed.",
    mnemonic: "CHAS: Think of a woman saying 'CHA-CHa! Yes!' with a graceful nod.",
    wrongAnswerTips: {
      'greet-7': "ចាស (chas) is for female speakers; បាទ (baat) is for male speakers. Remember: Chas for girls (CHArming Sisters).",
    },
  },

  'greet-9': {
    culturalNote: "ទេ is a versatile word meaning 'no' but also serving as a question particle. When placed at the end of a statement, it turns it into a yes/no question (like adding a question mark to speech). In negation, it pairs with មិន to form the 'not...no' double-negative structure.",
    mnemonic: "TEE: Like a golf TEE -- tiny little word, stands up straight and says 'Nope!'",
    funFact: "The Khmer double-negative structure មិន...ទេ is similar to French 'ne...pas'. For example, មិនយល់ទេ = 'don't understand' (literally 'not understand no').",
  },

  'greet-10': {
    culturalNote: "សូម comes from Sanskrit and is the all-purpose polite request word. It elevates any sentence from casual to polite, similar to 'please' but with a slightly more formal, reverent tone rooted in Khmer court language traditions.",
    mnemonic: "SOUM: 'So... um...' -- politely hesitating before asking, like saying please!",
    wrongAnswerTips: {
      'greet-6': "សូម alone = 'please'. When followed by ទោស it becomes សូមទោស = 'sorry'. Don't mix them up!",
    },
  },

  'greet-11': {
    culturalNote: "ស្រួល means comfortable, easy, or fine. When someone asks how you are, responding ស្រួល conveys contentment and ease. In Cambodian culture, expressing that you are 'comfortable' is a positive and grounded response, valued over exaggerated enthusiasm.",
    mnemonic: "SRUOL: Think 'STROLL' -- when life is easy, you just stroll along. You're fine!",
  },

  'greet-12': {
    culturalNote: "យ៉ាងម៉េច literally translates to 'in what manner?' and is the most direct way to ask 'how?' in Khmer. It can be used standalone as 'how are you?' or embedded in longer questions about methods and conditions.",
    mnemonic: "YEANG MECH: 'YANG, what MECHanism are you using to be well?' -- How are you?",
    charBreakdown: "យ៉ាង (manner/way) + ម៉េច (what/how) = in what way? / how?",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // MODULE 2: Numbers (num-1 through num-12)
  // ─────────────────────────────────────────────────────────────────────────

  'num-1': {
    culturalNote: "មួយ (one) is one of the few Khmer numbers that is a native Mon-Khmer root word, not borrowed from Sanskrit or Pali. Khmer has its own unique numeral script (១, ២, ៣...) that you'll see on currency, signs, and official documents alongside Arabic numerals.",
    mnemonic: "MUOY: 'MOO-ey, there's only ONE cow!' -- muoy sounds like a single cow mooing.",
    funFact: "Khmer numerals (១២៣) are one of the oldest numeral systems still in daily use, derived from ancient Indian numerals that also gave rise to Arabic numerals (123).",
  },

  'num-2': {
    culturalNote: "ពីរ (two) is fundamental in Khmer culture because duality is deeply embedded in Cambodian Buddhist philosophy -- pairs like merit/sin, life/death, and formal/informal speech patterns pervade the language.",
    mnemonic: "PII: Sounds like 'PEE' -- you have TWO peas in a pod!",
  },

  'num-3': {
    culturalNote: "បី (three) is considered a sacred number in Cambodian Buddhism, representing the Triple Gem: the Buddha, the Dharma (teachings), and the Sangha (monastic community). Many temple rituals are performed in threes.",
    mnemonic: "BEI: Sounds like 'BAY' -- picture three boats in a bay!",
    funFact: "Cambodians often bow three times before a Buddha statue, once for each element of the Triple Gem.",
  },

  'num-4': {
    culturalNote: "បួន (four) does not carry the unlucky superstition found in Chinese or Japanese cultures. In Cambodia, four is a neutral number, and Khmer culture has its own distinct set of lucky and unlucky number beliefs.",
    mnemonic: "BUAN: 'BWON' sounds like 'BONE' -- a dog has FOUR bones buried in the yard!",
  },

  'num-5': {
    culturalNote: "ប្រាំ (five) is the critical base number in the Khmer counting system. Numbers 6-9 are formed by adding 1-4 to five: ប្រាំមួយ (5+1=6), ប្រាំពីរ (5+2=7), ប្រាំបី (5+3=8), ប្រាំបួន (5+4=9). This quinary sub-system is unique among Southeast Asian languages.",
    mnemonic: "PRAM: 'Five fingers on your PALM' -- PRAM = PALM with five fingers!",
    funFact: "The Khmer 5+N system for 6-9 is thought to originate from ancient finger-counting: one hand (5) plus fingers on the other hand.",
  },

  'num-6': {
    culturalNote: "ប្រាំមួយ literally means 'five-one', showcasing the Khmer quinary (base-5) sub-system. This 5+1 pattern is a remnant of an ancient counting system predating Indian influence on the Khmer Empire.",
    mnemonic: "PRAM MUOY: 'Five plus one more MOOing cow' -- pram (5) + muoy (1) = 6.",
    charBreakdown: "ប្រាំ (five) + មួយ (one) = five plus one = six",
  },

  'num-7': {
    culturalNote: "ប្រាំពីរ (five-two) follows the quinary pattern. Seven is significant in Cambodian culture: the traditional Khmer wedding ceremony lasts seven rounds of blessing, and there are seven days of mourning traditions.",
    mnemonic: "PRAM PII: 'Five plus a pair (PII=two)' -- like a high-five plus a peace sign = 7.",
    charBreakdown: "ប្រាំ (five) + ពីរ (two) = five plus two = seven",
  },

  'num-8': {
    culturalNote: "ប្រាំបី (five-three) continues the pattern. While eight is extremely lucky in Chinese culture, in Khmer tradition the number carries no special superstition -- it's simply five plus three.",
    mnemonic: "PRAM BEI: 'PRAM(5) plus BEI(3) in the BAY' -- 5+3 boats = 8 boats in the bay!",
    charBreakdown: "ប្រាំ (five) + បី (three) = five plus three = eight",
  },

  'num-9': {
    culturalNote: "ប្រាំបួន (five-four) is the last of the quinary compound numbers before the decimal system takes over at ten. Nine holds special significance in Khmer culture as it sounds like the Pali-derived word for 'progress' or 'advancement'.",
    mnemonic: "PRAM BUAN: 'Five BONES plus Four BONES' -- 5+4=9 bones total!",
    charBreakdown: "ប្រាំ (five) + បួន (four) = five plus four = nine",
    funFact: "The number 9 is considered very auspicious in Cambodian culture. Important ceremonies and celebrations are often held on the 9th day or involve the number 9.",
  },

  'num-10': {
    culturalNote: "ដប់ (ten) marks the shift to the decimal system. From ten onward, Khmer numbers follow a base-10 structure similar to many other languages. The word is a native Mon-Khmer root, not a Sanskrit borrowing.",
    mnemonic: "DOP: Sounds like 'DROP' -- drop a bowling ball and knock down all TEN pins!",
  },

  'num-11': {
    culturalNote: "ម្ភៃ (twenty) is an irregular form that doesn't follow the expected pattern of ពីរដប់ (two-ten). This irregularity suggests an ancient, pre-systematic counting origin, similar to how French uses 'vingt' rather than 'deux-dix'.",
    mnemonic: "MPHAI: Sounds like 'em-FI(ghty)' -- think of 20 mighty fighters!",
    funFact: "Some linguists believe ម្ភៃ preserves a trace of an ancient vigesimal (base-20) counting system that existed in the region before Indian decimal influence.",
  },

  'num-12': {
    culturalNote: "មួយរយ (one hundred) follows the straightforward pattern of number + រយ (hundred). The Cambodian riel currency often comes in denominations of 100, making this word essential for daily market transactions in Cambodia.",
    mnemonic: "MUOY ROY: 'ONE ROYal hundred' -- the king has ONE hundred ROYal coins!",
    charBreakdown: "មួយ (one) + រយ (hundred) = one hundred",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // MODULE 3: Khmer Alphabet (alpha-1 through alpha-12)
  // ─────────────────────────────────────────────────────────────────────────

  'alpha-1': {
    culturalNote: "ក (ka) is the first consonant of the Khmer alphabet, which has 33 consonants -- the largest alphabet in the world according to Guinness World Records. Khmer script evolved from the ancient Indian Brahmi script via the Pallava script around the 7th century CE.",
    mnemonic: "ក looks like a chair with a little hook at the bottom -- K for Kitchen chair!",
    funFact: "The Khmer alphabet holds the Guinness World Record for the largest alphabet, with 74 letters including consonants, vowels, and independent vowels.",
  },

  'alpha-2': {
    culturalNote: "ខ (kha) is the aspirated version of ក. Khmer consonants come in pairs: unaspirated and aspirated. The puff of air (aspiration) completely changes the letter, similar to how 'k' and 'kh' are different sounds in Hindi.",
    mnemonic: "ខ looks like ក but with an extra curl on top -- the extra curl is the extra puff of air (aspiration)!",
    wrongAnswerTips: {
      'alpha-1': "ក (ka) has no aspiration; ខ (kha) has aspiration. The extra visual element in ខ signals the extra breath.",
    },
  },

  'alpha-3': {
    culturalNote: "គ (ko) belongs to the second series (voiced consonants) in Khmer phonology. The Khmer script organizes consonants into two series that affect the pronunciation of attached vowels, a system inherited from ancient Indian grammatical traditions.",
    mnemonic: "គ looks like a little bench or stool -- KO(w) sitting on a stool!",
    funFact: "The word គោ (koo) meaning 'cow' starts with this letter, making it easy to remember: គ is for គោ (cow).",
  },

  'alpha-4': {
    culturalNote: "ឃ (kho) is the voiced aspirated counterpart in the ka-group. Khmer arranges its consonants in groups of five (velar, palatal, retroflex, dental, labial), mirroring the ancient Indian phonetic classification system from Sanskrit grammar.",
    mnemonic: "ឃ has a tall vertical stroke like a flagpole -- imagine a KHO(king) waving a flag!",
  },

  'alpha-5': {
    culturalNote: "ង (ngo) is the nasal consonant of the velar group, producing the 'ng' sound found at the end of English words like 'sing'. Unlike English, Khmer can start words with this 'ng' sound, which takes practice for English speakers.",
    mnemonic: "ង looks like a little snake coiled up -- making an 'NNNG' hissing nasal sound!",
    funFact: "The 'ng' initial sound in words like ង៉ែត (ngaet, 'to look up') is one of the hardest Khmer sounds for English speakers, since English never starts words with 'ng'.",
  },

  'alpha-6': {
    culturalNote: "ច (cha) begins the palatal consonant group. It's the letter used in ចាន (plate/bowl), one of the first words Khmer children learn. The palatal group produces sounds made with the tongue against the roof of the mouth.",
    mnemonic: "ច looks like a curvy number 2 with a hook -- think 'CHAir' with curved legs!",
  },

  'alpha-7': {
    culturalNote: "ឆ (chha) is the aspirated palatal consonant. The distinction between ច (cha) and ឆ (chha) is purely the breath force -- a subtlety that takes dedicated listening practice for non-native speakers to distinguish reliably.",
    mnemonic: "ឆ has more strokes than ច -- more strokes = more breath = CHH(a) with a puff!",
    wrongAnswerTips: {
      'alpha-6': "ច (cha) is unaspirated, ឆ (chha) is aspirated. More visual complexity in the letter = more air.",
    },
  },

  'alpha-8': {
    culturalNote: "ជ (cho) is the voiced palatal consonant, used in common words like ជើង (foot/leg) and ជីវិត (life). As a second-series consonant, it changes how attached vowels are pronounced compared to first-series ច.",
    mnemonic: "ជ has a hook that drops down like a foot -- CHO is for ជើង (cheung, foot)!",
  },

  'alpha-9': {
    culturalNote: "ឈ (chho) is the voiced aspirated palatal consonant, used in important words like ឈើ (wood/tree). The full palatal group (ច ឆ ជ ឈ ញ) demonstrates the systematic five-fold organization inherited from Indian linguistic science.",
    mnemonic: "ឈ looks like ជ with an extra embellishment -- extra decoration = extra aspiration!",
  },

  'alpha-10': {
    culturalNote: "ញ (nyo) is the palatal nasal, producing a sound similar to the Spanish 'n' (as in canon). It's the letter in ញ៉ាំ (nyam, 'to eat'), arguably one of the most important words in any language!",
    mnemonic: "ញ looks like a person sitting cross-legged eating -- NYO(m) NYO(m), eating! ញ៉ាំ!",
    funFact: "ញ៉ាំ (nyam) meaning 'eat' is one of the first Khmer words most visitors to Cambodia learn, usually at a restaurant.",
  },

  'alpha-11': {
    culturalNote: "ដ (da) begins the retroflex consonant group, where the tongue curls back. However, in modern spoken Khmer, the retroflex sounds have largely merged with the dental sounds, so ដ and ត often sound identical in everyday speech.",
    mnemonic: "ដ has a flat top like a table -- DA(ining) table! Set the table for dinner!",
  },

  'alpha-12': {
    culturalNote: "ណ (na) is the retroflex nasal consonant, the last in this introductory set. It appears in words like ណា (which/where) and is used in the question particle ណាស់ (very much). Mastering these first 12 consonants gives you the complete velar and palatal groups.",
    mnemonic: "ណ looks like it has a little antenna on top -- NA(vigating) with an antenna to find where (ណា) things are!",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // MODULE 4: Food (food-1 through food-12)
  // ─────────────────────────────────────────────────────────────────────────

  'food-1': {
    culturalNote: "បាយ (cooked rice) is so central to Cambodian identity that the phrase 'have you eaten rice yet?' (បានញ៉ាំបាយហើយឬ?) serves as a common greeting, equivalent to 'how are you?'. A meal without rice is not considered a meal in Cambodia.",
    mnemonic: "BAAY: 'I survive BY eating rice' -- without rice, no Cambodian meal is complete! BAAY = BY = rice to live by.",
    funFact: "Cambodia has been a rice-growing civilization for over 2,000 years. The ancient Khmer Empire's wealth was built largely on its advanced rice irrigation systems.",
    wrongAnswerTips: {
      'food-3': "បាយ is cooked rice (the staple); នំបុ័ង is bread (a French colonial influence). Rice is the traditional Cambodian staple.",
    },
  },

  'food-2': {
    culturalNote: "ទឹក (water) is one of the most versatile root words in Khmer. It appears in dozens of compound words: ទឹកដោះគោ (milk, literally 'cow breast water'), ទឹកក្រូច (orange juice/the color orange, literally 'orange water'), and ទឹកកក (ice, literally 'solid water').",
    mnemonic: "TUK: 'TOOK a drink of water' -- I TOOK some TUK to drink!",
    funFact: "Tonle Sap, Cambodia's great lake, literally means 'large fresh water' -- showing how foundational ទឹក (water) is to Cambodian geography and identity.",
  },

  'food-3': {
    culturalNote: "នំបុ័ង (bread) entered Khmer cuisine during French colonial rule (1863-1953). The word នំ means 'cake/pastry' and បុ័ង derives from the French 'pain'. Baguettes remain wildly popular in Cambodia, sold from street carts everywhere.",
    mnemonic: "NOM BPONG: 'NOM NOM on a BAGUETTE' -- nomming on French bread!",
    charBreakdown: "នំ (cake/pastry) + បុ័ង (from French 'pain') = bread/baguette",
    funFact: "Cambodia's 'nom pang' sandwiches are a direct descendant of the French baguette and are considered one of the best street foods in Southeast Asia.",
  },

  'food-4': {
    culturalNote: "ត្រី (fish) is the primary protein source in Cambodian cuisine, far more common than meat. Cambodia's Tonle Sap lake is one of the most productive freshwater fisheries in the world, and the country has one of the highest per-capita fish consumption rates globally.",
    mnemonic: "TREI: 'TRAY of fish' -- a big TRAY full of TREI!",
    funFact: "Prahok, Cambodia's famous fermented fish paste, is so essential to the cuisine that it's nicknamed 'Cambodian cheese'. Nearly every savory dish uses it.",
  },

  'food-5': {
    culturalNote: "សាច់មាន់ literally means 'chicken meat'. Khmer specifies the animal and then adds សាច់ (meat) to clarify you mean the food, not the living creature. This pattern extends to all meats: សាច់គោ (beef), សាច់ជ្រូក (pork).",
    mnemonic: "SACH MOAN: 'SUCH a MOANING chicken' -- the chicken MOANs because it became SACH (meat)!",
    charBreakdown: "សាច់ (meat/flesh) + មាន់ (chicken) = chicken meat",
  },

  'food-6': {
    culturalNote: "បន្លែ (vegetables) plays a vital role in Cambodian cooking, with meals typically featuring several vegetable dishes alongside rice. Morning glory (ត្រកួន), water spinach, and banana flower are among the most beloved Khmer vegetables.",
    mnemonic: "BANLAE: 'A BAN on LAEzy eating -- eat your vegetables!'",
  },

  'food-7': {
    culturalNote: "ផ្លែឈើ literally means 'fruit of trees/wood', reflecting a beautifully literal Khmer compound. Cambodia is abundant with tropical fruits: mango, durian, rambutan, dragon fruit, and the beloved palm fruit from sugar palms.",
    mnemonic: "PLAE CHHEU: 'PLAY under the TREE and pick fruit' -- fruits come from trees!",
    charBreakdown: "ផ្លែ (fruit/product) + ឈើ (wood/tree) = tree fruit = fruit",
    funFact: "The sugar palm tree (ត្នោត) is Cambodia's national tree and appears on the Cambodian flag. Its fruit, sap, and wood are all essential to rural Cambodian life.",
  },

  'food-8': {
    culturalNote: "គុយទាវ is Cambodia's beloved noodle soup, typically eaten for breakfast. Originally of Chinese-Teochew origin, it has become a quintessentially Cambodian dish with unique local variations including rice noodles in clear pork or beef broth topped with fresh herbs.",
    mnemonic: "KUY TEAV: 'GOOEY-TEA(v)' -- gooey noodles in a tea-colored broth!",
    funFact: "Phnom Penh-style kuy teav is considered the gold standard, with vendors competing fiercely over broth recipes that are closely guarded family secrets.",
  },

  'food-9': {
    culturalNote: "ស្ករ (sugar) connects to Cambodia's ancient sugar palm tradition. For centuries, Cambodians have harvested palm sugar from the Borassus flabellifer tree, climbing 20-meter palms at dawn to collect sap that is then boiled into rich, caramel-flavored sugar.",
    mnemonic: "SKOR: Sounds like 'SCORE' -- you SCORE some sweet sugar!",
    funFact: "Cambodian palm sugar (ស្ករត្នោត) is considered a healthier alternative to refined sugar and has a distinctive caramel-butterscotch flavor prized by chefs worldwide.",
  },

  'food-10': {
    culturalNote: "ទឹកដោះគោ literally translates to 'cow breast water', a wonderfully literal Khmer compound. This direct descriptive naming is characteristic of Khmer, where many compound words transparently describe what they refer to.",
    mnemonic: "TUK DAH KOO: 'TOOK it from the COW (koo)' -- water from the cow = milk!",
    charBreakdown: "ទឹក (water/liquid) + ដោះ (breast) + គោ (cow) = cow's breast liquid = milk",
  },

  'food-11': {
    culturalNote: "កាហ្វេ is a French loanword from 'cafe', reflecting the lasting French colonial influence on Cambodian food culture. Cambodian iced coffee, made with sweetened condensed milk, is a beloved street drink with a distinctive rich sweetness unlike any other coffee tradition.",
    mnemonic: "KAA-FEE: Almost identical to English 'coffee' -- one of the easiest Khmer words to remember!",
    funFact: "Cambodia's Mondulkiri province grows high-quality Robusta coffee beans at altitude, and Cambodian coffee culture is experiencing a renaissance with specialty cafes appearing across Phnom Penh.",
  },

  'food-12': {
    culturalNote: "ស (salt) is the same single character as ស (white) in the color module, though they differ in tonal context and usage. Cambodia has a long history of salt production along its coast, particularly in Kampot province, where sea salt is harvested in traditional solar evaporation fields.",
    mnemonic: "SAU: 'SAUce needs SALT' -- add some SAU to your sauce!",
    wrongAnswerTips: {
      'color-5': "ស can mean both 'salt' (noun) and 'white' (adjective). Context determines meaning, similar to how English 'light' can mean brightness or weight.",
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // MODULE 5: Family (fam-1 through fam-12)
  // ─────────────────────────────────────────────────────────────────────────

  'fam-1': {
    culturalNote: "ម្តាយ (mother) holds a deeply revered position in Cambodian culture. Mothers are considered the spiritual heart of the family, and disrespecting one's mother is among the greatest social taboos. The Buddhist holiday of Pchum Ben honors deceased parents and ancestors.",
    mnemonic: "MDAY: Sounds like 'M-DAY' -- every day is Mother's Day in Cambodia!",
    funFact: "In Cambodia, children often refer to older women as ម្តាយ even if unrelated, as a term of deep respect.",
  },

  'fam-2': {
    culturalNote: "ឪពុក (father) combines two elements reflecting paternal authority. Cambodian fathers traditionally serve as the outward-facing head of household, while mothers manage internal family affairs -- a complementary partnership deeply embedded in Khmer cultural values.",
    mnemonic: "OV PUK: 'Oh! PAPA!' -- PUK sounds like 'pops/papa'!",
    charBreakdown: "ឪ (an exclamation/address term) + ពុក (father) = father (as a respectful address)",
  },

  'fam-3': {
    culturalNote: "បងប្រុស (older brother) uses បង which means 'older sibling' -- a critical term in Khmer that distinguishes older from younger siblings. This age-based hierarchy permeates all social relationships; you must know if someone is your 'bong' (older) or 'p'oon' (younger).",
    mnemonic: "BONG BPROH: 'BONG! Your big BROther punched the gong!' -- older BROther = bong bproh.",
    charBreakdown: "បង (older sibling) + ប្រុស (male) = older male sibling = older brother",
    wrongAnswerTips: {
      'fam-5': "បង = older sibling, ប្អូន = younger sibling. Both add ប្រុស (male) or ស្រី (female) to specify gender.",
    },
  },

  'fam-4': {
    culturalNote: "បងស្រី (older sister) is often used beyond biological family. Cambodians frequently call any older woman 'bong srei' as a friendly, respectful address -- at markets, restaurants, or workplaces. It builds instant social warmth.",
    mnemonic: "BONG SREI: 'BONG! Your big SIS(SREI) rang the bell!' -- older SISter = bong srei.",
    charBreakdown: "បង (older sibling) + ស្រី (female) = older female sibling = older sister",
  },

  'fam-5': {
    culturalNote: "ប្អូនប្រុស (younger brother) uses ប្អូន marking the younger position. In Cambodia, younger siblings are expected to show respect and deference to older siblings, who in turn bear responsibility for guiding and protecting them.",
    mnemonic: "P'OON BPROH: 'Little P'OON BOY' -- your younger bro is the little p'oon!",
    charBreakdown: "ប្អូន (younger sibling) + ប្រុស (male) = younger male sibling = younger brother",
  },

  'fam-6': {
    culturalNote: "ប្អូនស្រី (younger sister) follows the same pattern. The បង/ប្អូន distinction is so fundamental that Cambodians meeting someone new will quickly establish relative ages to know which term to use, even among non-relatives and friends.",
    mnemonic: "P'OON SREI: 'Little P'OON girl (SREI)' -- your younger sis is the little p'oon srei!",
    charBreakdown: "ប្អូន (younger sibling) + ស្រី (female) = younger female sibling = younger sister",
  },

  'fam-7': {
    culturalNote: "ជីដូន (grandmother) combines the respectful prefix ជី with ដូន. Grandparents hold tremendous authority and respect in Cambodian families, often living with the family and serving as primary caretakers and oral history keepers.",
    mnemonic: "JII DOUN: 'GEE, GRAN(DOUN)!' -- Gee, grandma! JII = the 'gee!' of seeing grandma.",
    charBreakdown: "ជី (grandparent prefix) + ដូន (grandmother specifically) = grandmother",
    funFact: "In rural Cambodia, grandmothers are often the primary storytellers, passing down Khmer folktales and Buddhist Jataka stories to grandchildren at bedtime.",
  },

  'fam-8': {
    culturalNote: "ជីតា (grandfather) uses the same ជី prefix for grandparents. The word តា alone is widely used as a respectful term for any elderly man, similar to how 'grandpa' might be used affectionately for any old man in English.",
    mnemonic: "JII DAA: 'GEE, GRANDPA (DAA)!' -- DAA sounds like 'da' as in 'granddad'!",
    charBreakdown: "ជី (grandparent prefix) + តា (grandfather/old man) = grandfather",
  },

  'fam-9': {
    culturalNote: "កូន (child) is used both for one's own children and as an affectionate term for any young person. It also forms compounds: កូនប្រុស (son), កូនស្រី (daughter), កូនចៅ (grandchild). The word carries deep warmth and tenderness in Khmer.",
    mnemonic: "KOUN: Sounds like 'COIN' -- your children are as precious as golden coins!",
  },

  'fam-10': {
    culturalNote: "ប្ដី (husband) is the standard term. In traditional Cambodian marriage, the groom's family pays a bride price to the bride's family, and the husband often moves into the wife's family compound -- the opposite of many Western traditions.",
    mnemonic: "PDEY: 'P-DAY is wedding DAY for the husband!' -- PDEY shows up on the big day.",
    funFact: "Traditional Khmer weddings last three days and involve elaborate ceremonies including hair cutting, thread tying, and the symbolic passing of the bride.",
  },

  'fam-11': {
    culturalNote: "ប្រពន្ធ (wife) derives from Sanskrit 'bandhu' (bond/relation). The Cambodian wedding tradition of tying red threads around the couple's wrists symbolizes the binding of two families, reflecting the importance of the marital bond in Khmer society.",
    mnemonic: "BPRORBPUN: Think 'PROPER-BOND' -- a wife is the PROPER BOND of marriage!",
  },

  'fam-12': {
    culturalNote: "គ្រួសារ (family) is the foundational social unit in Cambodia. Extended families often live together in compounds, and family obligations take precedence over individual desires. The concept of គ្រួសារ extends well beyond the nuclear family to include cousins, aunts, uncles, and close family friends.",
    mnemonic: "KRUOSAR: 'CREW-o-SAR' -- your family is your CREW, your posse, your squad!",
    funFact: "During Khmer New Year (April), Cambodians travel from cities back to their home villages to reunite with extended family, causing the largest annual migration in the country.",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // MODULE 6: Colors (color-1 through color-10)
  // ─────────────────────────────────────────────────────────────────────────

  'color-1': {
    culturalNote: "ក្រហម (red) is deeply symbolic in Cambodian culture. Red represents bravery, strength, and national identity -- it's a dominant color on the Cambodian flag. Red is also the color of choice for wedding decorations and auspicious celebrations.",
    mnemonic: "KRAHOM: 'Cra-HOM' -- a RED HOME! Picture a house painted bright red.",
    funFact: "The Cambodian flag features red as its primary color, symbolizing bravery and the nation's identity. The white Angkor Wat temple in the center represents spiritual heritage.",
  },

  'color-2': {
    culturalNote: "ខៀវ is fascinating because it covers both blue AND green in traditional Khmer, similar to how ancient languages often had one word for cool colors. To specify, Cambodians say ខៀវមេឃ (sky blue) or ខៀវបៃតង (blue-green). The standalone ខៀវ leans toward blue in modern usage.",
    mnemonic: "KHIEV: 'KEY-ev' -- the KEY to the sea is BLUE-green!",
    funFact: "The phenomenon of one word covering both blue and green exists in many languages worldwide (Japanese, Vietnamese, Thai) and is studied in linguistic relativity research.",
    wrongAnswerTips: {
      'color-3': "ខៀវ covers blue-green generally (leaning blue); បៃតង specifically means green. Use បៃតង when you specifically mean green.",
    },
  },

  'color-3': {
    culturalNote: "បៃតង (green) is the specific word for green, useful when ខៀវ would be ambiguous. Green is associated with nature, rice paddies, and the lush Cambodian countryside. Buddhist monks' robes in some traditions have green elements.",
    mnemonic: "BAITONG: 'BUY-TONG(ue) of green leaves' -- buy a green leaf to chew!",
    wrongAnswerTips: {
      'color-2': "បៃតង is specifically green; ខៀវ covers both blue and green. If you mean green vegetation, use បៃតង.",
    },
  },

  'color-4': {
    culturalNote: "លឿង (yellow) is the sacred color of Buddhism and royalty in Cambodia. Buddhist monks' saffron-yellow robes are ubiquitous, and the Royal Palace in Phnom Penh features yellow as a prominent color. Yellow represents Thursday in the traditional Khmer color-day system.",
    mnemonic: "LEOUNG: 'LEO the LION is YELLOW' -- the golden yellow lion!",
    funFact: "Each day of the week has an associated color in Khmer tradition. Yellow is Thursday, and some Cambodians wear the day's color for good luck.",
  },

  'color-5': {
    culturalNote: "ស (white) symbolizes purity and mourning in Cambodian culture. White is worn at funerals and during mourning periods, contrasting with Western associations. The white of Angkor Wat's limestone also makes white a symbol of heritage and spirituality.",
    mnemonic: "SAU: 'SNOW' starts with S -- S for SAU, S for Snow-white!",
    wrongAnswerTips: {
      'food-12': "ស as an adjective means 'white'; ស as a noun means 'salt'. White salt -- same character, context determines meaning!",
    },
  },

  'color-6': {
    culturalNote: "ខ្មៅ (black) is notable because 'Khmer' (ខ្មែរ) and 'ខ្មៅ' share the same root, and some etymologists believe the name 'Khmer' may be related to the word for dark/black, possibly referring to the darker complexion of the ancient Khmer people compared to their northern neighbors.",
    mnemonic: "KMAV: 'Ka-MAV(erick) in BLACK' -- the mysterious dark maverick!",
    funFact: "The theory connecting 'Khmer' to 'ខ្មៅ' (black/dark) is debated among linguists, but it reveals how deeply color words can be tied to cultural identity.",
  },

  'color-7': {
    culturalNote: "ពណ៌ស្វាយ (purple) literally means 'the color of mango', because ស្វាយ means mango. This likely references the deep purple-red color of certain ripe mango varieties common in Cambodia, showing how Khmer color names often derive from nature.",
    mnemonic: "POA SVAY: 'Purple is the color (POA) of MANGO (SVAY)' -- mangoes can be purple-red when ripe!",
    charBreakdown: "ពណ៌ (color) + ស្វាយ (mango) = the color of mango = purple",
    funFact: "Cambodia grows numerous mango varieties, and the Keo Romiet mango is considered one of the sweetest in the world.",
  },

  'color-8': {
    culturalNote: "ទឹកក្រូច (orange) literally means 'orange juice/orange water', using the same ទឹក (water/juice) root found in ទឹកដោះគោ (milk). The color is named after the fruit, just as in English -- one of many parallel naming patterns across languages.",
    mnemonic: "TUK KROUCH: 'TOOK an ORANGE (KROUCH)' -- the color of orange juice!",
    charBreakdown: "ទឹក (water/juice) + ក្រូច (orange fruit) = orange juice/color = orange",
  },

  'color-9': {
    culturalNote: "ផ្កាឈូក (pink) literally means 'lotus flower', because the lotus is Cambodia's quintessential pink flower. The lotus symbolizes purity rising from muddy water in Buddhist philosophy and is deeply sacred in Cambodian spiritual life.",
    mnemonic: "PKA CHHOUK: 'Pink-Ka LOTUS' -- pink is the color of the sacred lotus flower!",
    charBreakdown: "ផ្កា (flower) + ឈូក (lotus) = lotus flower = the color pink",
    funFact: "Lotus flowers grow abundantly in Cambodia's lakes and ponds. Every part of the plant is used: seeds for desserts, stems for stir-fry, and petals for temple offerings.",
  },

  'color-10': {
    culturalNote: "ត្នោត (brown) comes from the word for sugar palm tree, whose trunk and fruit have a rich brown color. The sugar palm (ត្នោត) is Cambodia's national tree, appearing on the flag, so this color name carries deep cultural resonance.",
    mnemonic: "TNAUT: 'The NUT-brown palm tree' -- TNAUT = the brown NUT of the palm!",
    funFact: "The sugar palm tree (Borassus flabellifer) provides sugar, fruit, juice, building materials, and weaving fibers. It is so important that harming one was once punishable by Cambodian law.",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // MODULE 7: Days & Time (day-1 through day-12)
  // ─────────────────────────────────────────────────────────────────────────

  'day-1': {
    culturalNote: "ថ្ងៃចន្ទ (Monday) literally means 'day of the Moon'. Like many languages influenced by Indian astronomy, Khmer names its days after celestial bodies. ចន្ទ comes from the Sanskrit/Pali word 'Chandra' meaning moon.",
    mnemonic: "TNGAI CHAN: 'The day (TNGAI) of the MOON (CHAN)' -- Monday = Moon-day, just like in English!",
    charBreakdown: "ថ្ងៃ (day) + ចន្ទ (moon, from Sanskrit Chandra) = Moon-day = Monday",
  },

  'day-2': {
    culturalNote: "ថ្ងៃអង្គារ (Tuesday) means 'day of Mars'. អង្គារ derives from the Sanskrit word for the planet Mars (Mangala/Angaraka). The Khmer planetary day system directly mirrors the ancient Indian astrological system adopted across Southeast Asia.",
    mnemonic: "TNGAI ONKEAR: 'ANGRY Tuesday' -- Mars is the ANGRY red planet, and ONKEAR sounds like ANGER!",
    charBreakdown: "ថ្ងៃ (day) + អង្គារ (Mars, from Sanskrit Angaraka) = Mars-day = Tuesday",
  },

  'day-3': {
    culturalNote: "ថ្ងៃពុធ (Wednesday) means 'day of Mercury'. ពុធ comes from Sanskrit 'Budha' (the planet Mercury, not to be confused with Buddha). Wednesday is traditionally considered an auspicious day for education and learning in Cambodian astrology.",
    mnemonic: "TNGAI PUT: 'PUT your studies on Wednesday' -- Mercury/Budha is the planet of wisdom!",
    charBreakdown: "ថ្ងៃ (day) + ពុធ (Mercury, from Sanskrit Budha) = Mercury-day = Wednesday",
    funFact: "In traditional Cambodian astrology, Wednesday is considered favorable for starting educational endeavors, signing contracts, and intellectual pursuits.",
  },

  'day-4': {
    culturalNote: "ថ្ងៃព្រហស្បតិ៍ (Thursday) means 'day of Jupiter'. ព្រហស្បតិ៍ derives from Sanskrit 'Brihaspati', the guru of the gods and lord of Jupiter. Thursday is traditionally considered the most auspicious day of the week in Cambodian culture.",
    mnemonic: "TNGAI PROHOAS: 'The PROS meet on Thursday' -- Jupiter's day is for the PROSperous!",
    charBreakdown: "ថ្ងៃ (day) + ព្រហស្បតិ៍ (Jupiter, from Sanskrit Brihaspati) = Jupiter-day = Thursday",
    funFact: "Many important Cambodian ceremonies and weddings are preferentially held on Thursdays because of its auspicious association with Jupiter, the 'guru planet'.",
  },

  'day-5': {
    culturalNote: "ថ្ងៃសុក្រ (Friday) means 'day of Venus'. សុក្រ comes from Sanskrit 'Shukra' meaning Venus. In Cambodian tradition, Friday is associated with love, beauty, and social gatherings -- fitting for the planet named after the goddess of love.",
    mnemonic: "TNGAI SOK: 'SOCK it to Friday!' -- SOK(ra) = Venus, the beautiful planet for a beautiful day!",
    charBreakdown: "ថ្ងៃ (day) + សុក្រ (Venus, from Sanskrit Shukra) = Venus-day = Friday",
  },

  'day-6': {
    culturalNote: "ថ្ងៃសៅរ៍ (Saturday) means 'day of Saturn'. សៅរ៍ comes from Sanskrit 'Shani/Shanaishchara' (Saturn). Saturday is traditionally a rest day in Cambodia, and markets are particularly busy as families shop for weekend meals.",
    mnemonic: "TNGAI SAU: 'SAUturday' -- SAU sounds like the start of SATURday!",
    charBreakdown: "ថ្ងៃ (day) + សៅរ៍ (Saturn, from Sanskrit Shani) = Saturn-day = Saturday",
  },

  'day-7': {
    culturalNote: "ថ្ងៃអាទិត្យ (Sunday) means 'day of the Sun'. អាទិត្យ comes from Sanskrit 'Aditya' (the Sun). Sunday is the primary day for temple visits, when Cambodian families bring food offerings to monks and earn merit.",
    mnemonic: "TNGAI AADIT: 'ADD IT to Sunday' -- AADIT(ya) = Sun, and Sunday = Sun-day!",
    charBreakdown: "ថ្ងៃ (day) + អាទិត្យ (Sun, from Sanskrit Aditya) = Sun-day = Sunday",
    funFact: "The seven-day week named after celestial bodies is remarkably consistent across cultures influenced by ancient Indian astronomy: Khmer, Thai, Hindi, and even English all follow this pattern.",
  },

  'day-8': {
    culturalNote: "ព្រឹក (morning) typically refers to the period from dawn until about 11 AM. Cambodian mornings start early -- monks collect alms at dawn (around 5-6 AM), and markets are busiest before 8 AM when it's still relatively cool.",
    mnemonic: "PRUEK: 'The ROOSTER goes PRUEK in the morning!' -- wake up at dawn!",
    funFact: "The traditional Cambodian morning greeting អរុណសួស្តី (arun suos sdei) means 'good dawn' and is used mainly in formal or written contexts.",
  },

  'day-9': {
    culturalNote: "ថ្ងៃ does double duty in Khmer: it means both 'day' (as in daytime/daylight) and 'day' (as in a calendar day). Context determines which meaning applies. It also forms the base of every day-of-the-week name (ថ្ងៃចន្ទ, ថ្ងៃអង្គារ, etc.).",
    mnemonic: "TNGAI: 'It's a NICE day (TNGAI) to be outside!' -- daytime = sun is out.",
  },

  'day-10': {
    culturalNote: "ល្ងាច (evening) refers to the period from about 5 PM until dark. Evenings in Cambodia are socially vibrant -- families gather, street food vendors set up, and night markets come alive. The cooler temperatures make evening the preferred time for outdoor socializing.",
    mnemonic: "LNGACH: 'Let's LUNCH... no, it's LNGACH (evening)!' -- too late for lunch, it's evening!",
  },

  'day-11': {
    culturalNote: "យប់ (night) carries a different social weight in Cambodia compared to Western cultures. Rural Cambodia traditionally follows early-to-bed patterns, while Phnom Penh has developed a vibrant nightlife. The traditional nighttime greeting រាត្រីសួស្តី (reatrei suos sdei) means 'good night'.",
    mnemonic: "YUP: 'YUP, it's dark -- time for bed!' -- yup, nighttime!",
  },

  'day-12': {
    culturalNote: "ឥឡូវ (now/at present) is essential for expressing urgency and immediacy. In a culture where time is often treated more fluidly than in the West, ឥឡូវ carries real weight -- when a Cambodian says ឥឡូវ, they genuinely mean right now.",
    mnemonic: "ELAV: 'E-LAV(a)! Quick, NOW! Like lava flowing -- immediate!' -- ឥឡូវ = right now!",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // MODULE 8: Body Parts (body-1 through body-12)
  // ─────────────────────────────────────────────────────────────────────────

  'body-1': {
    culturalNote: "ក្បាល (head) is considered the most sacred part of the body in Cambodian culture, influenced by Buddhist and Hindu traditions. Touching someone's head is deeply disrespectful, even for children. The head is believed to house the soul.",
    mnemonic: "KBAL: 'K-BALL on your head' -- imagine balancing a ball on your KBAL (head)!",
    funFact: "In Cambodia, you should never touch anyone's head, even to affectionately pat a child. Parents and monks are the only exceptions.",
  },

  'body-2': {
    culturalNote: "ភ្នែក (eyes) appears in many Khmer expressions. 'Having good eyes' (មានភ្នែកល្អ) means having good judgment, while 'big eyes' (ភ្នែកធំ) can mean greedy. Khmer traditional dance (Apsara) emphasizes expressive eye movements as a primary storytelling tool.",
    mnemonic: "PNEK: 'P-NECK... no wait, higher! EYES!' -- remember, it's above the neck!",
  },

  'body-3': {
    culturalNote: "ត្រចៀក (ears) is important in Khmer expressions about wisdom. 'Having ears' (មានត្រចៀក) implies being attentive and wise. Cambodian traditional music relies heavily on listeners developing trained ears for the complex tuning of instruments like the roneat (xylophone).",
    mnemonic: "TRACHEEK: 'TRACK what you HEAR with your ears' -- your ears TRACK(eek) sounds!",
  },

  'body-4': {
    culturalNote: "មាត់ (mouth) features in many Cambodian proverbs about speech and discretion. The saying មាត់មួយពាក្យ (one word from the mouth) emphasizes that spoken words carry serious weight and cannot be taken back in Khmer culture.",
    mnemonic: "MOAT: 'A MOAT surrounds the castle, and your MOUTH surrounds your teeth!' -- MOAT = mouth!",
  },

  'body-5': {
    culturalNote: "ច្រមុះ (nose) is featured in the Khmer expression ច្រមុះខ្ពស់ (high nose) which describes someone as proud or arrogant. In traditional Khmer beauty standards, a moderately shaped nose is considered ideal, differing from both flat and sharp nose preferences.",
    mnemonic: "CHRAMOH: 'CHRAM-OH! What a nose!' -- exclaiming at a big nose!",
  },

  'body-6': {
    culturalNote: "ដៃ (hand/arm) covers both hand and arm in a single word, which is common in many Asian languages. In Cambodian etiquette, the right hand is used for eating and passing objects, while the left hand is considered unclean. Always offer things with your right hand or both hands.",
    mnemonic: "DAI: 'DI(e) without my hands!' -- DAI = the hand you can't live without!",
    funFact: "In Cambodian etiquette, passing something with both hands shows maximum respect. Using only the left hand is considered very rude.",
  },

  'body-7': {
    culturalNote: "ជើង (leg/foot) covers both leg and foot. Feet are considered the lowest and most impure part of the body in Cambodian culture. Pointing your feet at someone, a Buddha statue, or a monk is extremely disrespectful. Always tuck your feet away when sitting on the floor.",
    mnemonic: "CHEUNG: 'CHEWING gum stuck on my FOOT!' -- always something on your cheung!",
    funFact: "When entering a Cambodian home or temple, you must remove your shoes. Pointing the soles of your feet toward a Buddha image is one of the most offensive things a visitor can do.",
  },

  'body-8': {
    culturalNote: "ចង្កេះ (waist) is relevant in traditional Khmer dance, where precise waist and hip movements are fundamental to the graceful Apsara dance style. The sampot (traditional Khmer garment) is tied and draped at the waist.",
    mnemonic: "CHANGKES: 'CHANGE your KEYS at the waist' -- your keys hang from your waist belt!",
  },

  'body-9': {
    culturalNote: "ខ្នង (back) appears in expressions of support and loyalty. 'Having someone's back' translates culturally in Khmer too. In traditional Khmer massage (a practice predating the modern spa industry), back treatment is considered essential for overall health.",
    mnemonic: "KNONG: 'KNOCKING on my BACK' -- someone is knocking on your knong!",
  },

  'body-10': {
    culturalNote: "ទ្រូង (chest) symbolizes courage and emotional depth in Khmer. The expression ទ្រូងធំ (big chest) can mean courageous, while chest-beating gestures in Khmer classical drama convey strong emotion or determination.",
    mnemonic: "TRUONG: 'STRONG chest!' -- TRUONG sounds like STRONG, and your chest houses your strong heart!",
  },

  'body-11': {
    culturalNote: "ពោះ (stomach/belly) is culturally significant because sharing food and having a full stomach is deeply tied to Cambodian hospitality. The greeting 'have you eaten?' reflects this -- ensuring someone's ពោះ is full equals caring for their wellbeing.",
    mnemonic: "POH: 'POH-t belly!' -- a full POH(t) belly after a big meal!",
    funFact: "ពោះ also means 'womb' in Khmer, connecting the concepts of nourishment and life-giving in a single word.",
  },

  'body-12': {
    culturalNote: "ក (neck) is a short monosyllabic word, typical of core body vocabulary in Khmer. The neck connects the sacred head to the body and is often adorned with gold necklaces (ក្រវ៉ាត់ក) during weddings and ceremonies as a symbol of wealth and beauty.",
    mnemonic: "KOR: 'COR(d) around your neck' -- a cord (necklace) hangs around your KOR!",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // MODULE 9: Places (place-1 through place-12)
  // ─────────────────────────────────────────────────────────────────────────

  'place-1': {
    culturalNote: "ផ្ទះ (house/home) is central to Cambodian life. Traditional Khmer houses are built on stilts to protect from flooding and wild animals, with the space beneath used for storage, hammock lounging, and livestock. Modern Cambodian homes still often follow this elevated design in rural areas.",
    mnemonic: "PTEH: 'Pa-TEH, there's no place like HOME!' -- coming home to PTEH!",
    funFact: "Traditional Cambodian stilted houses are designed so cleverly that during the annual Tonle Sap flooding, the space beneath the house becomes useful for boat storage.",
  },

  'place-2': {
    culturalNote: "ផ្សារ (market) is the social and economic heart of every Cambodian community. The most famous is Phsar Thmei (Central Market) in Phnom Penh, built in 1937 in striking Art Deco style. Markets in Cambodia sell everything from food to electronics to traditional medicine.",
    mnemonic: "PSAR: 'PS... are you going to the market?' -- PSAR is where everyone goes!",
    funFact: "Phnom Penh's Central Market (ផ្សារថ្មី) has one of the largest Art Deco domes in the world, designed by French architect Jean Desbois in the 1930s.",
  },

  'place-3': {
    culturalNote: "វត្ត (temple/pagoda) is the spiritual center of every Cambodian community. Cambodia has over 4,000 active Buddhist temples, and they serve as schools, community centers, hospitals, and shelters in addition to places of worship. Every Cambodian man is traditionally expected to ordain as a monk at a temple at least once.",
    mnemonic: "VUT: 'WHAT a beautiful temple!' -- VUT = WHAT(!) a sacred place!",
    funFact: "During the Khmer Rouge era, many temples were destroyed or repurposed. The post-1979 rebuilding of temples became a powerful symbol of Cambodian cultural resilience.",
  },

  'place-4': {
    culturalNote: "មន្ទីរពេទ្យ (hospital) is a formal compound word reflecting Khmer's tendency to build institutional names from Sanskrit/Pali roots. Cambodia's healthcare system has improved dramatically since the 1990s, with major hospitals in Phnom Penh and Siem Reap serving international patients.",
    mnemonic: "MONTIR PEET: 'The MONITOR BEEPS at the hospital' -- monitors beeping = hospital!",
    charBreakdown: "មន្ទីរ (institution/building, from Sanskrit mandira) + ពេទ្យ (medical, from Pali) = medical institution = hospital",
  },

  'place-5': {
    culturalNote: "សាលារៀន (school) literally means 'hall of learning'. Education is highly valued in Cambodian culture, and parents often make great sacrifices to send children to school. Temples historically served as the primary schools in Cambodia before the modern education system.",
    mnemonic: "SALA RIAN: 'SALAD and READING' -- at school you eat SALA(d) and RIAN (learn/read)!",
    charBreakdown: "សាលា (hall/building, from Sanskrit shala) + រៀន (to learn/study) = learning hall = school",
    funFact: "Before French colonization introduced Western-style schools, Buddhist temples were the primary educational institutions in Cambodia, with monks serving as teachers.",
  },

  'place-6': {
    culturalNote: "ទីក្រុង (city) is a compound that literally means 'place of the krong'. Phnom Penh, Cambodia's capital, has grown from a small trading post at the confluence of four rivers to a bustling city of over 2 million people, yet retains much of its French colonial and Khmer architectural character.",
    mnemonic: "TIKRONG: 'TI(cket) to the big KRONG (city)!' -- grab your ticket to the city!",
    charBreakdown: "ទី (place/location) + ក្រុង (city/urban area) = urban place = city",
  },

  'place-7': {
    culturalNote: "ភូមិ (village) is where the majority of Cambodians still live. About 80% of Cambodia's population lives in rural villages, organized around rice farming, fishing, and a local temple. The village chief (មេភូមិ) is an important community leader.",
    mnemonic: "PHUMI: 'The PERFUME of rice paddies in the village' -- PHU(mi) = rural village fragrance!",
    funFact: "Cambodian village names often describe their geography or history: ភូមិព្រៃ (Forest Village), ភូមិស្ទឹង (River Village), etc.",
  },

  'place-8': {
    culturalNote: "ហាង (shop/store) is used for all kinds of retail establishments. In Cambodia, small family-run shops line every street, selling everything from mobile phones to fried insects. The concept of the 'shop-house' (combined home and business) is central to Cambodian urban life.",
    mnemonic: "HAANG: 'HANG out at the shop!' -- let's HAANG at the store!",
  },

  'place-9': {
    culturalNote: "ធនាគារ (bank) derives from Sanskrit/Pali roots meaning 'treasury'. Cambodia has a unique dual-currency economy where both US dollars and Cambodian riel are used in daily transactions, making banks important for currency exchange as well as savings.",
    mnemonic: "THNAAKEA: 'Think of your MONEY at the BANK' -- THNAAKEA holds your treasure!",
    funFact: "Cambodia is one of the most dollarized economies in the world. US dollars are accepted nearly everywhere, with riel used mainly for small change (amounts under $1).",
  },

  'place-10': {
    culturalNote: "ឧទ្យាន (park) comes from Sanskrit 'udyana' meaning garden. Cambodia's parks range from small urban green spaces to vast national parks. The country has 7 national parks protecting dense tropical forests, endangered wildlife, and ancient temple ruins.",
    mnemonic: "UTTAYAN: 'UT(ter) JOY in the park!' -- UTTAYAN = a place of utter enjoyment!",
  },

  'place-11': {
    culturalNote: "ព្រលានយន្តហោះ (airport) is one of the longest compound words in everyday Khmer. Cambodia's main international airports are Phnom Penh and Siem Reap (gateway to Angkor Wat), with a massive new airport near Siem Reap opened to handle growing tourism.",
    mnemonic: "PROLAN YONTAHOS: 'The PLANE LAUNCHES from the airport' -- planes (yontahos = flying machine) at the field (prolan)!",
    charBreakdown: "ព្រលាន (field/ground) + យន្ត (machine, from Sanskrit yantra) + ហោះ (to fly) = field of flying machines = airport",
  },

  'place-12': {
    culturalNote: "ស្ថានីយ (station) derives from Sanskrit 'sthaniya' meaning a fixed place or station. Cambodia's railway system, originally built during French colonial rule, fell into disrepair but has been gradually restored, with the Phnom Penh-Sihanoukville route reopened for passengers.",
    mnemonic: "STHANII: Sounds like 'STATION' already -- the Sanskrit root is the ancestor of the English word too!",
    funFact: "Cambodia's Royal Railway was built by the French starting in 1929. After decades of disuse, train service between Phnom Penh and the coast was revived in 2016.",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // MODULE 10: Useful Phrases (phrase-1 through phrase-12)
  // ─────────────────────────────────────────────────────────────────────────

  'phrase-1': {
    culturalNote: "ខ្ញុំ (I/me) is the standard first-person pronoun, but Khmer has over a dozen ways to say 'I' depending on formality, gender, age, and social status. ខ្ញុំ is the safest, most neutral choice. In very formal speech, ខ្ញុំបាទ (male) or ខ្ញុំចាស (female) are used.",
    mnemonic: "KNHOM: 'NOME... as in, I'm a garden GNOME!' -- KNHOM = the little me!",
    funFact: "Cambodian pronoun choice encodes social relationships. Speaking to a monk, you'd use ខ្ញុំព្រះករុណា. To royalty, ខ្ញុំព្រះបាទម្ចាស់. Each pronoun signals a precise social position.",
  },

  'phrase-2': {
    culturalNote: "អ្នក (you) is the polite, general-purpose second-person pronoun. Like ខ្ញុំ, Khmer has many alternatives: លោក (sir), លោកស្រី (madam), បង (older person), ប្អូន (younger person). Using the right pronoun shows social awareness and respect.",
    mnemonic: "NEAK: 'NECK and neck, I'm talking to YOU!' -- NEAK = the person right in front of you!",
  },

  'phrase-3': {
    culturalNote: "គាត់ (he/she) is gender-neutral -- one of the simplifying features of Khmer. Unlike French or Spanish, Khmer does not grammatically distinguish gender in its pronouns. Context or additional words clarify if you mean he or she when needed.",
    mnemonic: "KOAT: 'COAT -- he or she wears a COAT!' -- gender-neutral, like a coat anyone can wear!",
    funFact: "Many Southeast Asian languages (Thai, Vietnamese, Khmer) historically used gender-neutral third-person pronouns, predating the modern Western push for gender-inclusive language.",
  },

  'phrase-4': {
    culturalNote: "ខ្ញុំយល់ (I understand) is a crucial phrase for language learners. Cambodians greatly appreciate when foreigners make any effort to speak Khmer and will respond enthusiastically when you indicate comprehension. Even partial understanding is worth signaling.",
    mnemonic: "KNHOM YUL: 'I (KNHOM) YELL: I get it!' -- YUL(l) = I understand!",
    charBreakdown: "ខ្ញុំ (I) + យល់ (to understand) = I understand",
  },

  'phrase-5': {
    culturalNote: "ខ្ញុំមិនយល់ (I don't understand) demonstrates the Khmer negation pattern: មិន + verb + ទេ. While the ទេ is often dropped in casual speech, the full pattern is មិន...ទេ, forming a grammatical sandwich around the verb -- similar to French ne...pas.",
    mnemonic: "KNHOM MIN YUL: 'I MIN(d) -- I don't get it!' -- MIN = the negation = not!",
    charBreakdown: "ខ្ញុំ (I) + មិន (not) + យល់ (understand) = I do not understand",
    wrongAnswerTips: {
      'phrase-4': "ខ្ញុំយល់ = I understand (positive). ខ្ញុំមិនយល់ = I don't understand (negative). The key difference is មិន (not).",
    },
  },

  'phrase-6': {
    culturalNote: "ជួយខ្ញុំ (help me) places the verb first, reflecting Khmer's subject-verb-object word order (though the subject is often dropped). Adding សូម (please) before it -- សូមជួយខ្ញុំ -- is the polite form you'd use with strangers.",
    mnemonic: "JUOY KNHOM: 'JOY! Someone is helping ME (KNHOM)!' -- asking for help brings JOY!",
    charBreakdown: "ជួយ (to help) + ខ្ញុំ (me) = help me",
  },

  'phrase-7': {
    culturalNote: "តម្លៃប៉ុន្មាន (how much does it cost?) is essential for markets and shops, where bargaining is the norm. In Cambodian markets, the initial asking price is typically 2-3 times the expected final price, and friendly haggling is an expected social interaction.",
    mnemonic: "TOMLAY PONMAAN: 'What's the TOLL to PAY, MAN?' -- TOMLAY = price, PONMAAN = how much!",
    charBreakdown: "តម្លៃ (price/value) + ប៉ុន្មាន (how much/how many) = what is the price?",
    funFact: "At most Cambodian markets, bargaining is expected and even enjoyed. Starting at about 50-60% of the asking price is a common strategy for tourists.",
  },

  'phrase-8': {
    culturalNote: "នៅឯណា (where is it?) is built from the location marker នៅ and the question word ឯណា. Khmer question words typically come at the end of sentences, the opposite of English. So 'the market where?' is the natural Khmer word order: ផ្សារនៅឯណា?",
    mnemonic: "NOV AE NA: 'NOW, where is it? AE? NA?' -- searching everywhere!",
    charBreakdown: "នៅ (at/located) + ឯណា (where) = located where? = where is it?",
  },

  'phrase-9': {
    culturalNote: "ខ្ញុំចង់បាន (I want) is the polite way to express desire. ចង់ alone means 'to want', and បាន adds the meaning of 'to get/obtain'. Together they form a softer expression than ចង់ alone, similar to saying 'I'd like to have' rather than just 'I want'.",
    mnemonic: "KNHOM CHONG BAAN: 'I (KNHOM) CHOSE to BAN hunger -- I WANT food!' -- wanting something to end the need.",
    charBreakdown: "ខ្ញុំ (I) + ចង់ (to want) + បាន (to get/obtain) = I want to have",
  },

  'phrase-10': {
    culturalNote: "អ្នកនិយាយភាសាអង់គ្លេសទេ? (Do you speak English?) is a survival phrase for tourists. English proficiency is growing rapidly in Cambodia, especially among young people in cities. In tourist areas like Siem Reap, many Cambodians speak impressive English learned from tourists and media.",
    mnemonic: "NEAK NIYEAY PHIESA ANGLEIS TEE: 'You (NEAK) speak (NIYEAY) language (PHIESA) English (ANGLEIS)?' -- just string the concepts together!",
    charBreakdown: "អ្នក (you) + និយាយ (speak) + ភាសា (language) + អង់គ្លេស (English) + ទេ (question particle) = do you speak English?",
  },

  'phrase-11': {
    culturalNote: "ច្រើន (many/much) is used for both countable and uncountable nouns, unlike English which distinguishes 'many' from 'much'. It's also used in the common intensifier ច្រើនណាស់ (very much/a lot) and in expressions of gratitude: អរគុណច្រើន (thank you very much).",
    mnemonic: "CHRAEN: 'A CRANE carries MANY fish!' -- the crane (CHRAEN) catches a lot!",
    wrongAnswerTips: {
      'phrase-12': "ច្រើន = many/much (large quantity); តិច = few/little (small quantity). They are opposites.",
    },
  },

  'phrase-12': {
    culturalNote: "តិច (few/little) is also used as a softening particle in requests, similar to 'a little' or 'a bit' in English. Saying បន្តិច (a tiny bit) or មួយតិច (a little) makes requests gentler and more polite, an important conversational strategy in Cambodian culture.",
    mnemonic: "TECH: 'Just a TOUCH, just a TECH' -- a tiny bit, a little touch!",
    wrongAnswerTips: {
      'phrase-11': "តិច = few/little (small amount); ច្រើន = many/much (large amount). They are antonyms.",
    },
  },
};

export default culturalContext;
