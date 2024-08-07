const pool = require("../config/db");

const getTicketDetailsForUser = async (userId, isValid) => {
    let getTicketQ;
    if (isValid) {
        // Get only valid non expired tickets
        getTicketQ = `
        SELECT * FROM user_ticket.tickets 
        WHERE user_id = $1 
        AND is_valid = true 
        AND expiry_time > current_time()
        ORDER BY issue_time desc
        `;
    }
    else {
        // Get alld tickets
        getTicketQ =  `
        SELECT * FROM user_ticket.tickets 
        WHERE user_id = $1 
        ORDER BY issue_time DESC
        `
    }
    const { rows } = pool.query(getTicketQ, [userId]);
    return rows;
}

const createTicketForUser = async (userId, tripDetails) => {
    const createTicketForUserQ = `
    INSERT INTO user_ticket.tickets (ticket_qr, issue_time, expiry_time, trip_details, is_valid, user_id)
    VALUES ($1, $2, $3, $4, $5, $6)
    `
    const ticket_qr = 'fill QR here';
    const currentTime = new Date();
    const expiryTime = new Date(currentTime.getTime() + ( 1 * 60 * 60 * 1000));
    const isValid = true;
    await pool.query(createTicketForUserQ, [ticket_qr, currentTime, expiryTime, tripDetails, isValid, userId]);
}

module.exports = {
    getTicketDetailsForUser,
    createTicketForUser
}