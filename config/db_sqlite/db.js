require('dotenv').config();
const sqlite3 = require("sqlite3").verbose();
const filepath = "./" + process.env.SQLITE_DB_PATH;

function createDbConnection() {
  const db = new sqlite3.Database(filepath, (error) => {
    if (error) {
      return console.error(error.message);
    }
  });
  console.log("Connection with SQLite has been established");
  return db;
}

const db = createDbConnection();

module.exports = {
  db
}