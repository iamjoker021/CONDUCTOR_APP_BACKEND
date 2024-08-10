const sqlite3 = require("sqlite3").verbose();
const filepath = "./conductor_app.db";

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