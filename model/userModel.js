const { db } = require("../config/db_sqlite/db");

const addUser = async (name, email, password_hash, phoneno, role) => {
    const addUserQ = `
    INSERT INTO users (name, email, password_hash, phoneno, role)
    VALUES (?, ?, ?, ?, ?)
    `;
    return new Promise((resolve, reject) => {
        db.run(addUserQ, [name, email, password_hash, phoneno, role], function(err) {
            if (err) {
                return reject(err);
            }
            resolve({ lastID: this.lastID });
        });
    });
};

const getUserDetailsByUsername = async (email) => {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
            if (err) {
                return reject(err);
            }
            resolve(row);
        });
    });
};

module.exports = {
    addUser,
    getUserDetailsByUsername
};
