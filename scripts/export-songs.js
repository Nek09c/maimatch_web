const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

// Map database categories to UI categories
const categoryMap = {
  'maimai': 'maimai',
  'POPS＆アニメ': 'popAndAnime',
  'ゲーム＆バラエティ': 'gameAndVariety',
  'niconico＆ボーカロイド': 'niconicoAndVocaloid',
  'オンゲキ＆チュウニズム': 'ongekiAndChunithm',
  '東方Project': 'touhou'
};

const dbPath = path.join(__dirname, '../data/db.sqlite3');
const outputPath = path.join(__dirname, '../src/data/songs-from-db.json');

console.log('Exporting songs from SQLite database...');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err);
    process.exit(1);
  }
  console.log('Connected to SQLite database');
});

db.all('SELECT songId, title, category FROM Songs ORDER BY title', [], (err, rows) => {
  if (err) {
    console.error('Error querying database:', err);
    process.exit(1);
  }

  const songs = rows.map((row, index) => ({
    id: row.songId,
    title: row.title,
    category: categoryMap[row.category] || 'unknown'
  }));

  // Ensure output directory exists
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Write to JSON file
  fs.writeFileSync(outputPath, JSON.stringify(songs, null, 2));
  
  console.log(`Exported ${songs.length} songs to ${outputPath}`);
  
  // Show category breakdown
  const categoryCount = {};
  songs.forEach(song => {
    categoryCount[song.category] = (categoryCount[song.category] || 0) + 1;
  });
  
  console.log('\nSongs by category:');
  Object.entries(categoryCount).forEach(([category, count]) => {
    console.log(`  ${category}: ${count}`);
  });

  db.close();
}); 