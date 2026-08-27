/*
 * seed.js — puts starter data on disk the very first time the server boots.
 *
 * Idempotent: if data/books.json already exists and has books in it, we leave
 * it completely alone. That means an instructor can edit the catalogue by hand
 * and restarts will not stomp on the changes.
 */

const Book = require('./models/Book');

// 16 books, two per genre, so the Explore filter always returns something.
const SAMPLE_BOOKS = [
  {
    id: 1,
    title: 'The Midnight Library',
    author: 'Matt Haig',
    genre: 'Fiction',
    year: 2020,
    rating: 4.2,
    price: 12.99,
    pages: 304,
    language: 'English',
    cover: 'images/covers/the-midnight-library.svg',
    description:
      'Between life and death there is a library, and its shelves hold every life you could have lived. Nora Seed gets one night to try them all.'
  },
  {
    id: 2,
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    genre: 'Fiction',
    year: 1960,
    rating: 4.5,
    price: 9.5,
    pages: 336,
    language: 'English',
    cover: 'images/covers/to-kill-a-mockingbird.svg',
    description:
      'A small Alabama town, a court case that splits it in two, and a child watching her father stand up for what is right.'
  },
  {
    id: 3,
    title: 'The Girl with the Dragon Tattoo',
    author: 'Stieg Larsson',
    genre: 'Mystery',
    year: 2005,
    rating: 4.1,
    price: 11.25,
    pages: 480,
    language: 'English',
    cover: 'images/covers/the-girl-with-the-dragon-tattoo.svg',
    description:
      'A disgraced journalist and a brilliant, guarded hacker reopen a disappearance that has gone unsolved for forty years.'
  },
  {
    id: 4,
    title: 'Gone Girl',
    author: 'Gillian Flynn',
    genre: 'Mystery',
    year: 2012,
    rating: 4.0,
    price: 10.75,
    pages: 432,
    language: 'English',
    cover: 'images/covers/gone-girl.svg',
    description:
      'On their fifth wedding anniversary, Amy vanishes. Every clue points at her husband, and every chapter changes the story.'
  },
  {
    id: 5,
    title: 'Dune',
    author: 'Frank Herbert',
    genre: 'Sci-Fi',
    year: 1965,
    rating: 4.4,
    price: 14.99,
    pages: 688,
    language: 'English',
    cover: 'images/covers/dune.svg',
    description:
      'On the desert planet Arrakis, water is currency and spice is power. A young heir is thrown into a war he was raised to survive.'
  },
  {
    id: 6,
    title: 'Project Hail Mary',
    author: 'Andy Weir',
    genre: 'Sci-Fi',
    year: 2021,
    rating: 4.6,
    price: 15.5,
    pages: 496,
    language: 'English',
    cover: 'images/covers/project-hail-mary.svg',
    description:
      'A lone astronaut wakes up light years from Earth with no memory of how he got there, and only science to work the problem.'
  },
  {
    id: 7,
    title: 'The Hobbit',
    author: 'J. R. R. Tolkien',
    genre: 'Fantasy',
    year: 1937,
    rating: 4.5,
    price: 10.0,
    pages: 310,
    language: 'English',
    cover: 'images/covers/the-hobbit.svg',
    description:
      'Bilbo Baggins wanted nothing more than a quiet second breakfast. Instead he got thirteen dwarves, a wizard, and a dragon.'
  },
  {
    id: 8,
    title: 'A Wizard of Earthsea',
    author: 'Ursula K. Le Guin',
    genre: 'Fantasy',
    year: 1968,
    rating: 4.2,
    price: 9.99,
    pages: 183,
    language: 'English',
    cover: 'images/covers/a-wizard-of-earthsea.svg',
    description:
      'A gifted young mage lets pride loose a shadow into the world, then spends a lifetime learning to name it.'
  },
  {
    id: 9,
    title: 'The Diary of a Young Girl',
    author: 'Anne Frank',
    genre: 'Biography',
    year: 1947,
    rating: 4.4,
    price: 8.25,
    pages: 283,
    language: 'English',
    cover: 'images/covers/the-diary-of-a-young-girl.svg',
    description:
      'Two years in hiding in Amsterdam, written by a teenager with an extraordinary eye for people and for hope.'
  },
  {
    id: 10,
    title: 'Steve Jobs',
    author: 'Walter Isaacson',
    genre: 'Biography',
    year: 2011,
    rating: 3.9,
    price: 13.4,
    pages: 656,
    language: 'English',
    cover: 'images/covers/steve-jobs.svg',
    description:
      'Built from more than forty interviews with Jobs himself, an unvarnished portrait of the man behind Apple.'
  },
  {
    id: 11,
    title: 'Sapiens: A Brief History of Humankind',
    author: 'Yuval Noah Harari',
    genre: 'History',
    year: 2011,
    rating: 4.3,
    price: 16.0,
    pages: 498,
    language: 'English',
    cover: 'images/covers/sapiens.svg',
    description:
      'How an unremarkable ape came to run the planet, told through the stories, myths and money we all agreed to believe in.'
  },
  {
    id: 12,
    title: 'Guns, Germs, and Steel',
    author: 'Jared Diamond',
    genre: 'History',
    year: 1997,
    rating: 3.8,
    price: 12.1,
    pages: 480,
    language: 'English',
    cover: 'images/covers/guns-germs-and-steel.svg',
    description:
      'Why did history unfold so differently on different continents? A sweeping argument that geography, not genius, set the pace.'
  },
  {
    id: 13,
    title: 'Atomic Habits',
    author: 'James Clear',
    genre: 'Self-Help',
    year: 2018,
    rating: 4.4,
    price: 14.25,
    pages: 320,
    language: 'English',
    cover: 'images/covers/atomic-habits.svg',
    description:
      'Small changes compound. A practical system for building good habits one per cent at a time, and for breaking the bad ones.'
  },
  {
    id: 14,
    title: 'Deep Work',
    author: 'Cal Newport',
    genre: 'Self-Help',
    year: 2016,
    rating: 4.1,
    price: 11.9,
    pages: 296,
    language: 'English',
    cover: 'images/covers/deep-work.svg',
    description:
      'Focused, distraction-free concentration is becoming rare exactly as it becomes valuable. Here is how to train it back.'
  },
  {
    id: 15,
    title: 'Pride and Prejudice',
    author: 'Jane Austen',
    genre: 'Romance',
    year: 1813,
    rating: 4.3,
    price: 7.99,
    pages: 279,
    language: 'English',
    cover: 'images/covers/pride-and-prejudice.svg',
    description:
      'Elizabeth Bennet has opinions, Mr Darcy has manners nobody likes, and both of them are wrong about almost everything.'
  },
  {
    id: 16,
    title: 'Beach Read',
    author: 'Emily Henry',
    genre: 'Romance',
    year: 2020,
    rating: 3.9,
    price: 10.5,
    pages: 361,
    language: 'English',
    cover: 'images/covers/beach-read.svg',
    description:
      'Two blocked writers, neighbouring beach houses, and a bet to swap genres for the summer. It goes about as well as expected.'
  }
];

async function seed() {
  // Only write books if there is nothing there yet.
  const bookCount = await Book.countDocuments();
  if (bookCount === 0) {
    await Book.insertMany(SAMPLE_BOOKS);
    console.log('[seed] Wrote ' + SAMPLE_BOOKS.length + ' sample books to the books collection');
  } else {
    console.log('[seed] books collection already has ' + bookCount + ' books, leaving it alone.');
  }

  // Messages need no seeding — Mongo creates the collection on first insert.
}

module.exports = { seed, SAMPLE_BOOKS };

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
