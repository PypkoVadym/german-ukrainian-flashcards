require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

const seedData = [
  // Greetings
  { german: 'Hallo', ukrainian: 'Привіт', difficulty: 'easy', module: 'Greetings' },
  { german: 'Tschüss', ukrainian: 'Бувай', difficulty: 'easy', module: 'Greetings' },
  { german: 'Guten Morgen', ukrainian: 'Доброго ранку', difficulty: 'easy', module: 'Greetings' },
  { german: 'Guten Tag', ukrainian: 'Добрий день', difficulty: 'easy', module: 'Greetings' },
  { german: 'Guten Abend', ukrainian: 'Доброго вечора', difficulty: 'medium', module: 'Greetings' },
  { german: 'Danke', ukrainian: 'Дякую', difficulty: 'easy', module: 'Greetings' },
  { german: 'Bitte', ukrainian: 'Будь ласка', difficulty: 'easy', module: 'Greetings' },
  { german: 'Ja', ukrainian: 'Так', difficulty: 'easy', module: 'Greetings' },
  { german: 'Nein', ukrainian: 'Ні', difficulty: 'easy', module: 'Greetings' },
  { german: 'Entschuldigung', ukrainian: 'Вибачте', difficulty: 'medium', module: 'Greetings' },
  // Numbers
  { german: 'eins', ukrainian: 'один', difficulty: 'easy', module: 'Numbers' },
  { german: 'zwei', ukrainian: 'два', difficulty: 'easy', module: 'Numbers' },
  { german: 'drei', ukrainian: 'три', difficulty: 'easy', module: 'Numbers' },
  { german: 'vier', ukrainian: 'чотири', difficulty: 'easy', module: 'Numbers' },
  { german: 'fünf', ukrainian: "п'ять", difficulty: 'easy', module: 'Numbers' },
  { german: 'sechs', ukrainian: 'шість', difficulty: 'easy', module: 'Numbers' },
  { german: 'sieben', ukrainian: 'сім', difficulty: 'easy', module: 'Numbers' },
  { german: 'acht', ukrainian: 'вісім', difficulty: 'easy', module: 'Numbers' },
  { german: 'neun', ukrainian: "дев'ять", difficulty: 'easy', module: 'Numbers' },
  { german: 'zehn', ukrainian: 'десять', difficulty: 'easy', module: 'Numbers' },
  // Colors
  { german: 'rot', ukrainian: 'червоний', difficulty: 'easy', module: 'Colors' },
  { german: 'blau', ukrainian: 'синій', difficulty: 'easy', module: 'Colors' },
  { german: 'grün', ukrainian: 'зелений', difficulty: 'easy', module: 'Colors' },
  { german: 'gelb', ukrainian: 'жовтий', difficulty: 'easy', module: 'Colors' },
  { german: 'schwarz', ukrainian: 'чорний', difficulty: 'easy', module: 'Colors' },
  { german: 'weiß', ukrainian: 'білий', difficulty: 'easy', module: 'Colors' },
  { german: 'orange', ukrainian: 'оранжевий', difficulty: 'medium', module: 'Colors' },
  { german: 'grau', ukrainian: 'сірий', difficulty: 'medium', module: 'Colors' },
  { german: 'braun', ukrainian: 'коричневий', difficulty: 'medium', module: 'Colors' },
  { german: 'rosa', ukrainian: 'рожевий', difficulty: 'medium', module: 'Colors' },
  // Food
  { german: 'Brot', ukrainian: 'хліб', difficulty: 'easy', module: 'Food' },
  { german: 'Wasser', ukrainian: 'вода', difficulty: 'easy', module: 'Food' },
  { german: 'Milch', ukrainian: 'молоко', difficulty: 'easy', module: 'Food' },
  { german: 'Apfel', ukrainian: 'яблуко', difficulty: 'easy', module: 'Food' },
  { german: 'Käse', ukrainian: 'сир', difficulty: 'medium', module: 'Food' },
  { german: 'Ei', ukrainian: 'яйце', difficulty: 'easy', module: 'Food' },
  { german: 'Fleisch', ukrainian: "м'ясо", difficulty: 'medium', module: 'Food' },
  { german: 'Fisch', ukrainian: 'риба', difficulty: 'easy', module: 'Food' },
  { german: 'Reis', ukrainian: 'рис', difficulty: 'easy', module: 'Food' },
  { german: 'Suppe', ukrainian: 'суп', difficulty: 'easy', module: 'Food' },
  // Animals
  { german: 'Hund', ukrainian: 'собака', difficulty: 'easy', module: 'Animals' },
  { german: 'Katze', ukrainian: 'кішка', difficulty: 'easy', module: 'Animals' },
  { german: 'Vogel', ukrainian: 'птах', difficulty: 'easy', module: 'Animals' },
  { german: 'Pferd', ukrainian: 'кінь', difficulty: 'medium', module: 'Animals' },
  { german: 'Kuh', ukrainian: 'корова', difficulty: 'easy', module: 'Animals' },
  { german: 'Schwein', ukrainian: 'свиня', difficulty: 'medium', module: 'Animals' },
  { german: 'Maus', ukrainian: 'миша', difficulty: 'easy', module: 'Animals' },
  { german: 'Bär', ukrainian: 'ведмідь', difficulty: 'medium', module: 'Animals' },
  { german: 'Hase', ukrainian: 'заєць', difficulty: 'medium', module: 'Animals' },
  { german: 'Löwe', ukrainian: 'лев', difficulty: 'hard', module: 'Animals' },
];

async function seedIfEmpty() {
  const { count, error } = await supabase
    .from('words')
    .select('*', { count: 'exact', head: true });

  if (error) {
    console.error('Error checking seed status:', error.message);
    return;
  }

  if (count === 0) {
    const { error: insertError } = await supabase.from('words').insert(seedData);
    if (insertError) {
      console.error('Seed error:', insertError.message);
    } else {
      console.log(`Seeded database with ${seedData.length} words.`);
    }
  }
}

module.exports = { supabase, seedIfEmpty };
