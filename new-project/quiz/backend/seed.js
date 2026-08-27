/*
 * seed.js — puts the starter question bank on disk the first time the server
 * boots.
 *
 * Idempotent: if data/questions.json already has questions we leave it alone,
 * so an instructor can add their own questions and restarts will not undo it.
 *
 * Note: every question carries its own `correctAnswer`. That is deliberate —
 * grading happens in the browser, because these students are not ready for a
 * server-side check yet. Peeking at the JSON in DevTools is a fine lesson too.
 */

const Question = require('./models/Question');
const Score = require('./models/Score');

// 36 questions: 9 in each of the four categories (ARCHITECTURE section 5).
const SAMPLE_QUESTIONS = [
  // ---------------------------------------------------------- General Knowledge
  {
    id: 1,
    category: 'General Knowledge',
    question: 'How many continents are there on Earth?',
    options: ['Five', 'Six', 'Seven', 'Eight'],
    correctAnswer: 'Seven',
    difficulty: 'easy'
  },
  {
    id: 2,
    category: 'General Knowledge',
    question: 'What is the capital city of Australia?',
    options: ['Sydney', 'Melbourne', 'Canberra', 'Perth'],
    correctAnswer: 'Canberra',
    difficulty: 'medium'
  },
  {
    id: 3,
    category: 'General Knowledge',
    question: 'Which is the largest ocean on Earth?',
    options: ['Atlantic Ocean', 'Indian Ocean', 'Arctic Ocean', 'Pacific Ocean'],
    correctAnswer: 'Pacific Ocean',
    difficulty: 'easy'
  },
  {
    id: 4,
    category: 'General Knowledge',
    question: 'How many sides does a hexagon have?',
    options: ['Five', 'Six', 'Seven', 'Eight'],
    correctAnswer: 'Six',
    difficulty: 'easy'
  },
  {
    id: 5,
    category: 'General Knowledge',
    question: 'Mixing blue and yellow paint gives you which colour?',
    options: ['Purple', 'Orange', 'Green', 'Brown'],
    correctAnswer: 'Green',
    difficulty: 'easy'
  },
  {
    id: 6,
    category: 'General Knowledge',
    question: 'Which language has the most native speakers in the world?',
    options: ['English', 'Mandarin Chinese', 'Spanish', 'Hindi'],
    correctAnswer: 'Mandarin Chinese',
    difficulty: 'medium'
  },
  {
    id: 7,
    category: 'General Knowledge',
    question: 'What is the currency of Japan?',
    options: ['Won', 'Yuan', 'Yen', 'Rupee'],
    correctAnswer: 'Yen',
    difficulty: 'easy'
  },
  {
    id: 8,
    category: 'General Knowledge',
    question: 'Which musical instrument has 88 keys?',
    options: ['Organ', 'Piano', 'Accordion', 'Harpsichord'],
    correctAnswer: 'Piano',
    difficulty: 'medium'
  },
  {
    id: 9,
    category: 'General Knowledge',
    question: 'How many minutes are there in a full day?',
    options: ['1200', '1440', '1660', '2400'],
    correctAnswer: '1440',
    difficulty: 'medium'
  },

  // ------------------------------------------------------------------- Science
  {
    id: 10,
    category: 'Science',
    question: 'Which planet is known as the Red Planet?',
    options: ['Venus', 'Mars', 'Jupiter', 'Saturn'],
    correctAnswer: 'Mars',
    difficulty: 'easy'
  },
  {
    id: 11,
    category: 'Science',
    question: 'What is the chemical symbol for gold?',
    options: ['Go', 'Gd', 'Au', 'Ag'],
    correctAnswer: 'Au',
    difficulty: 'medium'
  },
  {
    id: 12,
    category: 'Science',
    question: 'Which gas do plants absorb from the air to make food?',
    options: ['Oxygen', 'Nitrogen', 'Carbon dioxide', 'Hydrogen'],
    correctAnswer: 'Carbon dioxide',
    difficulty: 'easy'
  },
  {
    id: 13,
    category: 'Science',
    question: 'Which part of the cell is called the powerhouse of the cell?',
    options: ['Nucleus', 'Ribosome', 'Mitochondria', 'Cell membrane'],
    correctAnswer: 'Mitochondria',
    difficulty: 'easy'
  },
  {
    id: 14,
    category: 'Science',
    question: 'At what temperature does water freeze, in degrees Celsius?',
    options: ['0', '10', '32', '100'],
    correctAnswer: '0',
    difficulty: 'easy'
  },
  {
    id: 15,
    category: 'Science',
    question: 'How many bones are there in the adult human body?',
    options: ['186', '206', '226', '246'],
    correctAnswer: '206',
    difficulty: 'medium'
  },
  {
    id: 16,
    category: 'Science',
    question: 'Which force keeps the planets in orbit around the Sun?',
    options: ['Magnetism', 'Friction', 'Gravity', 'Air pressure'],
    correctAnswer: 'Gravity',
    difficulty: 'easy'
  },
  {
    id: 17,
    category: 'Science',
    question: 'What is the largest planet in our solar system?',
    options: ['Earth', 'Saturn', 'Neptune', 'Jupiter'],
    correctAnswer: 'Jupiter',
    difficulty: 'easy'
  },
  {
    id: 18,
    category: 'Science',
    question: 'The formula H2O describes which everyday substance?',
    options: ['Salt', 'Water', 'Sugar', 'Air'],
    correctAnswer: 'Water',
    difficulty: 'easy'
  },

  // ------------------------------------------------------------------- History
  {
    id: 19,
    category: 'History',
    question: 'In which year did the Second World War end?',
    options: ['1918', '1939', '1945', '1950'],
    correctAnswer: '1945',
    difficulty: 'easy'
  },
  {
    id: 20,
    category: 'History',
    question: 'Who was the first President of the United States?',
    options: ['Thomas Jefferson', 'Abraham Lincoln', 'George Washington', 'John Adams'],
    correctAnswer: 'George Washington',
    difficulty: 'easy'
  },
  {
    id: 21,
    category: 'History',
    question: 'Which ancient wonder still stands in Egypt today?',
    options: [
      'The Hanging Gardens',
      'The Great Pyramid of Giza',
      'The Colossus of Rhodes',
      'The Lighthouse of Alexandria'
    ],
    correctAnswer: 'The Great Pyramid of Giza',
    difficulty: 'medium'
  },
  {
    id: 22,
    category: 'History',
    question: 'Which civilisation built the city of Machu Picchu?',
    options: ['The Maya', 'The Aztec', 'The Inca', 'The Olmec'],
    correctAnswer: 'The Inca',
    difficulty: 'medium'
  },
  {
    id: 23,
    category: 'History',
    question: 'Who was the first person to walk on the Moon?',
    options: ['Yuri Gagarin', 'Buzz Aldrin', 'Neil Armstrong', 'Michael Collins'],
    correctAnswer: 'Neil Armstrong',
    difficulty: 'easy'
  },
  {
    id: 24,
    category: 'History',
    question: 'In which year did the Berlin Wall fall?',
    options: ['1961', '1979', '1989', '1991'],
    correctAnswer: '1989',
    difficulty: 'medium'
  },
  {
    id: 25,
    category: 'History',
    question: 'Which country gave the Statue of Liberty to the United States?',
    options: ['Britain', 'France', 'Spain', 'Italy'],
    correctAnswer: 'France',
    difficulty: 'easy'
  },
  {
    id: 26,
    category: 'History',
    question: 'In which year did Nelson Mandela become President of South Africa?',
    options: ['1990', '1992', '1994', '1996'],
    correctAnswer: '1994',
    difficulty: 'medium'
  },
  {
    id: 27,
    category: 'History',
    question: 'Augustus was the first emperor of which empire?',
    options: ['The Greek Empire', 'The Roman Empire', 'The Ottoman Empire', 'The Persian Empire'],
    correctAnswer: 'The Roman Empire',
    difficulty: 'medium'
  },

  // --------------------------------------------------------------------- Sport
  {
    id: 28,
    category: 'Sport',
    question: 'How many players from one team are on the pitch in a football match?',
    options: ['Nine', 'Ten', 'Eleven', 'Twelve'],
    correctAnswer: 'Eleven',
    difficulty: 'easy'
  },
  {
    id: 29,
    category: 'Sport',
    question: 'How often are the Summer Olympic Games normally held?',
    options: ['Every two years', 'Every three years', 'Every four years', 'Every five years'],
    correctAnswer: 'Every four years',
    difficulty: 'easy'
  },
  {
    id: 30,
    category: 'Sport',
    question: 'In which sport would you perform a slam dunk?',
    options: ['Volleyball', 'Basketball', 'Handball', 'Netball'],
    correctAnswer: 'Basketball',
    difficulty: 'easy'
  },
  {
    id: 31,
    category: 'Sport',
    question: 'How many rings are there on the Olympic flag?',
    options: ['Four', 'Five', 'Six', 'Seven'],
    correctAnswer: 'Five',
    difficulty: 'easy'
  },
  {
    id: 32,
    category: 'Sport',
    question: 'Which country has won the most FIFA World Cup titles?',
    options: ['Germany', 'Italy', 'Argentina', 'Brazil'],
    correctAnswer: 'Brazil',
    difficulty: 'medium'
  },
  {
    id: 33,
    category: 'Sport',
    question: 'In tennis, what word is used for a score of zero?',
    options: ['Nil', 'Love', 'Duck', 'Blank'],
    correctAnswer: 'Love',
    difficulty: 'medium'
  },
  {
    id: 34,
    category: 'Sport',
    question: 'How many points is a touchdown worth in American football?',
    options: ['Three', 'Six', 'Seven', 'Eight'],
    correctAnswer: 'Six',
    difficulty: 'medium'
  },
  {
    id: 35,
    category: 'Sport',
    question: 'Which sport is played with a shuttlecock?',
    options: ['Squash', 'Badminton', 'Table tennis', 'Cricket'],
    correctAnswer: 'Badminton',
    difficulty: 'easy'
  },
  {
    id: 36,
    category: 'Sport',
    question: 'Roughly how long is a marathon?',
    options: ['21 km', '32 km', '42 km', '50 km'],
    correctAnswer: '42 km',
    difficulty: 'medium'
  }
];

// A few starter scores so the leaderboard has something to show on day one.
const SAMPLE_SCORES = [
  // {
  //   id: 1,
  //   name: 'Amina',
  //   score: 8,
  //   total: 9,
  //   category: 'Science',
  //   percent: 89,
  //   playedAt: '2026-02-10T09:14:00.000Z'
  // },
  // {
  //   id: 2,
  //   name: 'Kaleb',
  //   score: 9,
  //   total: 9,
  //   category: 'History',
  //   percent: 100,
  //   playedAt: '2026-02-11T15:02:00.000Z'
  // },
  // {
  //   id: 3,
  //   name: 'Sara',
  //   score: 6,
  //   total: 9,
  //   category: 'Sport',
  //   percent: 67,
  //   playedAt: '2026-02-12T11:45:00.000Z'
  // },
  // {
  //   id: 4,
  //   name: 'Daniel',
  //   score: 7,
  //   total: 9,
  //   category: 'General Knowledge',
  //   percent: 78,
  //   playedAt: '2026-02-12T18:30:00.000Z'
  // },
  // {
  //   id: 5,
  //   name: 'Hana',
  //   score: 5,
  //   total: 9,
  //   category: 'Science',
  //   percent: 56,
  //   playedAt: '2026-02-13T08:05:00.000Z'
  // }
];

async function seed() {
  const questionCount = await Question.countDocuments();
  if (questionCount === 0) {
    await Question.insertMany(SAMPLE_QUESTIONS);
    console.log('[seed] Wrote ' + SAMPLE_QUESTIONS.length + ' questions to the questions collection');
  } else {
    console.log('[seed] questions collection already has ' + questionCount + ' questions, leaving it alone.');
  }

  const scoreCount = await Score.countDocuments();
  if (scoreCount === 0 && SAMPLE_SCORES.length > 0) {
    await Score.insertMany(SAMPLE_SCORES);
    console.log('[seed] Wrote ' + SAMPLE_SCORES.length + ' sample scores to the scores collection');
  }
}

module.exports = { seed, SAMPLE_QUESTIONS, SAMPLE_SCORES };

// Allow running it on its own too:  node seed.js
if (require.main === module) {
  require('dotenv').config();
  const connectDB = require('./utils/db');
  connectDB()
    .then(seed)
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
