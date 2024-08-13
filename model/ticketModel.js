const { db } = require("../config/db_sqlite/db");

const getTicketDetailsForUser = async (userId, isValid) => {
    let getTicketQ;
    if (isValid) {
        getTicketQ = `
        SELECT * FROM tickets 
        WHERE user_id = ? 
        AND expiry_time > CURRENT_TIMESTAMP
        ORDER BY issue_time DESC;
        `;
    } else {
        getTicketQ =  `
        SELECT * FROM tickets 
        WHERE user_id = ?
        ORDER BY issue_time DESC;
        `;
    }
    return new Promise((resolve, reject) => {
        db.all(getTicketQ, [userId], (err, rows) => {
            if (err) {
                return reject(err);
            }
            rows.forEach(stop => {
                stop['trip_details'] = JSON.parse(stop['trip_details']);
            });
            resolve(rows);
        });
    });
};

const getTicketDetailsById = async (tikcetId) => {
    const getTicketDetailsByIdQ = `
    SELECT * FROM tickets
    WHERE ticket_unique_identifier = ?
    `
    return new Promise((resolve, reject) => {
        db.all(getTicketDetailsByIdQ, [tikcetId], (err, rows) => {
            if (err) {
                return reject(err);
            }
            rows.forEach(stop => {
                stop['trip_details'] = JSON.parse(stop['trip_details']);
            });
            resolve(rows);
        });
    });
}

const createTicketForUser = async (userId, tripDetails) => {
    const createTicketForUserQ = `
    INSERT INTO tickets (issue_time, expiry_time, trip_details, user_id)
    VALUES (?, ?, ?, ?)
    `;
    const currentTime = new Date();
    const ticketExpireDuration = parseInt(process.env.TICKET_EXPIRY_DURATION || (1 * 60 * 60 * 1000));
    const expiryTime = new Date(currentTime.getTime() + ticketExpireDuration);

    return new Promise((resolve, reject) => {
        db.run(createTicketForUserQ, [currentTime.toISOString(), expiryTime.toISOString(), JSON.stringify(tripDetails), userId], function(err) {
            if (err) {
                return reject(err);
            }
            resolve({ lastID: this.lastID });
        });
    });
};

module.exports = {
    getTicketDetailsForUser,
    getTicketDetailsById,
    createTicketForUser
};
