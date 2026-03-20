const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'words.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS words (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    german TEXT NOT NULL,
    ukrainian TEXT NOT NULL,
    difficulty TEXT NOT NULL DEFAULT 'medium' CHECK(difficulty IN ('easy', 'medium', 'hard')),
    module TEXT NOT NULL DEFAULT 'General',
    dateAdded TEXT NOT NULL DEFAULT (datetime('now'))
  )
`);

const count = db.prepare('SELECT COUNT(*) as count FROM words').get();
if (count.count === 0) {
  const insert = db.prepare(
    'INSERT INTO words (german, ukrainian, difficulty, module, dateAdded) VALUES (?, ?, ?, ?, datetime("now"))'
  );

  const seedData = [
    // Greetings
    ['Hallo', 'Привіт', 'easy', 'Greetings'],
    ['Tschüss', 'Бувай', 'easy', 'Greetings'],
    ['Guten Morgen', 'Доброго ранку', 'easy', 'Greetings'],
    ['Guten Tag', 'Добрий день', 'easy', 'Greetings'],
    ['Guten Abend', 'Доброго вечора', 'medium', 'Greetings'],
    ['Danke', 'Дякую', 'easy', 'Greetings'],
    ['Bitte', 'Будь ласка', 'easy', 'Greetings'],
    ['Ja', 'Так', 'easy', 'Greetings'],
    ['Nein', 'Ні', 'easy', 'Greetings'],
    ['Entschuldigung', 'Вибачте', 'medium', 'Greetings'],
    // Numbers
    ['eins', 'один', 'easy', 'Numbers'],
    ['zwei', 'два', 'easy', 'Numbers'],
    ['drei', 'три', 'easy', 'Numbers'],
    ['vier', 'чотири', 'easy', 'Numbers'],
    ['fünf', "п'ять", 'easy', 'Numbers'],
    ['sechs', 'шість', 'easy', 'Numbers'],
    ['sieben', 'сім', 'easy', 'Numbers'],
    ['acht', 'вісім', 'easy', 'Numbers'],
    ['neun', "дев'ять", 'easy', 'Numbers'],
    ['zehn', 'десять', 'easy', 'Numbers'],
    // Colors
    ['rot', 'червоний', 'easy', 'Colors'],
    ['blau', 'синій', 'easy', 'Colors'],
    ['grün', 'зелений', 'easy', 'Colors'],
    ['gelb', 'жовтий', 'easy', 'Colors'],
    ['schwarz', 'чорний', 'easy', 'Colors'],
    ['weiß', 'білий', 'easy', 'Colors'],
    ['orange', 'оранжевий', 'medium', 'Colors'],
    ['grau', 'сірий', 'medium', 'Colors'],
    ['braun', 'коричневий', 'medium', 'Colors'],
    ['rosa', 'рожевий', 'medium', 'Colors'],
    // Food
    ['Brot', 'хліб', 'easy', 'Food'],
    ['Wasser', 'вода', 'easy', 'Food'],
    ['Milch', 'молоко', 'easy', 'Food'],
    ['Apfel', 'яблуко', 'easy', 'Food'],
    ['Käse', 'сир', 'medium', 'Food'],
    ['Ei', 'яйце', 'easy', 'Food'],
    ['Fleisch', "м'ясо", 'medium', 'Food'],
    ['Fisch', 'риба', 'easy', 'Food'],
    ['Reis', 'рис', 'easy', 'Food'],
    ['Suppe', 'суп', 'easy', 'Food'],
    // Animals
    ['Hund', 'собака', 'easy', 'Animals'],
    ['Katze', 'кішка', 'easy', 'Animals'],
    ['Vogel', 'птах', 'easy', 'Animals'],
    ['Pferd', 'кінь', 'medium', 'Animals'],
    ['Kuh', 'корова', 'easy', 'Animals'],
    ['Schwein', 'свиня', 'medium', 'Animals'],
    ['Maus', 'миша', 'easy', 'Animals'],
    ['Bär', 'ведмідь', 'medium', 'Animals'],
    ['Hase', 'заєць', 'medium', 'Animals'],
    ['Löwe', 'лев', 'hard', 'Animals'],
  ];

  const insertMany = db.transaction((words) => {
    for (const w of words) insert.run(...w);
  });
  insertMany(seedData);
  console.log(`Seeded database with ${seedData.length} words.`);
}

module.exports = db;
