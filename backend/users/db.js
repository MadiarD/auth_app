const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("users.db");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT,
    username TEXT,
    email TEXT UNIQUE,
    provider TEXT,
    password TEXT,
    isAdmin INTEGER DEFAULT 0
  );
`);

db.all('PRAGMA table_info(users);', (err, cols) => {
  if (!cols.some(c => c.name === 'isAdmin')) {
    db.run('ALTER TABLE users ADD COLUMN isAdmin INTEGER DEFAULT 0;');
  }
});


module.exports = db;
