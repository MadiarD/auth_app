const sqlite3      = require('sqlite3').verbose();
const { promisify } = require('util');

const DB_PATH = 'users.db';

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) console.error('❌ Ошибка открытия БД:', err.message);
  else     console.log('✅ SQLite открыт →', DB_PATH);
});


db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id       TEXT PRIMARY KEY,
      name     TEXT,
      username TEXT,
      email    TEXT UNIQUE,
      provider TEXT,
      password TEXT,
      isAdmin  INTEGER DEFAULT 0
    );
  `);

  db.all('PRAGMA table_info(users);', (err, cols) => {
    if (!err && !cols.some((c) => c.name === 'isAdmin')) {
      db.run('ALTER TABLE users ADD COLUMN isAdmin INTEGER DEFAULT 0;');
    }
  });
});

db.getAsync = promisify(db.get).bind(db);
db.allAsync = promisify(db.all).bind(db);
db.runAsync = (sql, params = []) =>
  new Promise((resolve, reject) =>
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else     resolve(this);        
    })
  );


module.exports = db;
