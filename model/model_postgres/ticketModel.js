require('dotenv').config();
const pool = require("../config/db");

const getTicketDetailsForUser = async (userId, isValid) => {
    let getTicketQ;
    if (isValid) {
        // Get only valid non expired tickets
        getTicketQ = `
        SELECT * FROM user_ticket.tickets 
        WHERE user_id = $1 
        AND expiry_time > current_time
        ORDER BY issue_time DESC;
        `;
    }
    else {
        // Get all tickets
        getTicketQ =  `
        SELECT * FROM user_ticket.tickets 
        WHERE user_id = $1
        ORDER BY issue_time ASC;
        `
    }
    const { rows } = await pool.query(getTicketQ, [userId]);
    return rows;
}

const getTicketDetailsById = async (tikcetId) => {
    const getTicketDetailsByIdQ = `
    SELECT * FROM tickets
    WHERE ticket_unique_identifier = $1
    `
    const { rows } = await pool.query(getTicketDetailsByIdQ, [tikcetId]);
    return rows;
}

const createTicketForUser = async (userId, tripDetails) => {
    const createTicketForUserQ = `
    INSERT INTO user_ticket.tickets (issue_time, expiry_time, trip_details, user_id)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING ticket_unique_identifier
    `
    const currentTime = new Date();
    const ticketExpireDuration = parseInt(process.env.TICKET_EXPIRY_DURATION || (1 * 60 * 60 * 1000));
    const expiryTime = new Date(currentTime.getTime() + ticketExpireDuration);
    const { rows } = await pool.query(createTicketForUserQ, [currentTime, expiryTime, tripDetails, userId]);
    return { ticketId: rows[0] };
}

const updateTicketPaymentStatus = async (tikcetId, status, orderId=false) => {
    if (orderId) {
        const updateTicketPaymentStatusQ = `
        UPDATE user_ticket.tickets
        SET payment_status = $1
        WHERE ticket_unique_identifier = $2
        AND order_id = $3
        `;
        await pool.query(updateTicketPaymentStatusQ, [status, tikcetId, orderId]);
    }
    else {
        const updateTicketPaymentStatusQ = `
        UPDATE user_ticket.tickets
        SET payment_status = $1
        WHERE ticket_unique_identifier = $2
        `;
        await pool.query(updateTicketPaymentStatusQ, [status, tikcetId]);
    }
}

const updateTicketOrderId = async (tikcetId, orderId) => {
    const updateTicketOrderIdQ = `
    UPDATE user_ticket.tickets
    SET order_id = $1
    WHERE ticket_unique_identifier = $2
    `;
    await pool.query(updateTicketOrderIdQ, [orderId, tikcetId]);
}

module.exports = {
    getTicketDetailsForUser,
    getTicketDetailsById,
    createTicketForUser,
    updateTicketPaymentStatus,
    updateTicketOrderId,
}