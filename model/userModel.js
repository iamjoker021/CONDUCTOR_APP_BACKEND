const pool = require("../config/db");

const addUser = async (name, email, password_hash, phoneno, role) => {
    const addUserQ = `
    INSERT INTO 
    user_ticket.users (name, email, password_hash, phoneno, role)
    VALUES ($1, $2, $3, $4, $5)
    `;
    await pool.query(addUserQ, [name, email, password_hash, phoneno, role])
}

const getUserDetailsByUsername = async (email) => {
    const { rows } = await pool.query('SELECT * FROM user_ticket.users WHERE email = $1', [email])
    return rows;
}

module.exports = {
    addUser,
    getUserDetailsByUsername
}