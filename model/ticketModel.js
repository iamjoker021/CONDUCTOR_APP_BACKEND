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

const getLastInsertedRecord = async (insertResult) => {
    // Retrieve the ticket unique identifier
    const ticketUniqueIdentifier = await new Promise((resolve, reject) => {
        db.all('SELECT ticket_unique_identifier FROM tickets ORDER BY issue_time DESC LIMIT 1', (err, row) => {
            if (err) {
                return reject(err);
            }
            resolve({ticketId: row[0].ticket_unique_identifier}); // Handle case where row is null
        });
    });
    return ticketUniqueIdentifier;
}

const getTicketDetailsByID = (ticketId) => {
    const getTicketDetailsByIDQ = `
    SELECT * FROM tickets WHERE ticket_unique_identifier = ?
    `
    return new Promise((resolve, reject) => {
        db.all(getTicketDetailsByIDQ, [ticketId], (err, rows) => {
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

const validateTicketByID = async (ticketId) => {
    const validateTicketByIDQ = `
    UPDATE tickets SET validated_time = current_timestamp
    WHERE ticket_unique_identifier = ?
    AND validated_time IS NULL;
    `
    return new Promise((resolve, reject) => {
        db.run(validateTicketByIDQ, [ticketId], function(err) {
            if (err) {
                return reject(err);
            }
            resolve({ message: 'Update does not throw any errro' });
        });
    });
}

const createTicketForUser = async (userId, tripDetails) => {
    const createTicketForUserQ = `
    INSERT INTO tickets (issue_time, expiry_time, trip_details, user_id)
    VALUES (?, ?, ?, ?)
    RETURNING ticket_unique_identifier
    `;
    const currentTime = new Date();
    const ticketExpireDuration = parseInt(process.env.TICKET_EXPIRY_DURATION || (1 * 60 * 60 * 1000));
    const expiryTime = new Date(currentTime.getTime() + ticketExpireDuration);

    try {
        // Insert the ticket
        const insertResult = await new Promise((resolve, reject) => {
            db.run(createTicketForUserQ, [currentTime.toISOString(), expiryTime.toISOString(), JSON.stringify(tripDetails), userId], function(err) {
                if (err) {
                    return reject(err);
                }
                resolve(this.lastID); // Resolve with last inserted ID
            });
        });

        return getLastInsertedRecord(insertResult);
    } catch (error) {
        throw error; // Re-throw error after logging
    }
};

const updateTicketPaymentStatus = async (tikcetId, status, orderId=false) => {
    if (orderId) {
        const updateTicketPaymentStatusQ = `
        UPDATE tickets
        SET payment_status = ?
        WHERE ticket_unique_identifier = ?
        AND order_id = ?
        `;
        const updatedData = new Promise((resolve, reject) => {
            db.run(updateTicketPaymentStatusQ, [status, tikcetId, orderId], function(err) {
                if (err) {
                    return reject(err);
                }
                resolve({ ticketId: this.lastID });
            });
        });
        return getLastInsertedRecord(updatedData);
    }
    else {
        const updateTicketPaymentStatusQ = `
        UPDATE tickets
        SET payment_status = ?
        WHERE ticket_unique_identifier = ?
        `;
        const updatedData = new Promise((resolve, reject) => {
            db.run(updateTicketPaymentStatusQ, [status, tikcetId], function(err) {
                if (err) {
                    return reject(err);
                }
                resolve({ ticketId: this.lastID });
            });
        });
        return getLastInsertedRecord(updatedData);
    }
}

const updateTicketOrderId = async (tikcetId, orderId) => {
    const updateTicketOrderIdQ = `
    UPDATE tickets
    SET order_id = ?
    WHERE ticket_unique_identifier = ?
    `;
    const updatedData = new Promise((resolve, reject) => {
        db.run(updateTicketOrderIdQ, [orderId, tikcetId], function(err) {
            if (err) {
                return reject(err);
            }
            resolve({ ticketId: this.lastID });
        });
    })
    return getLastInsertedRecord(updatedData);
}

module.exports = {
    getTicketDetailsForUser,
    getTicketDetailsByID,
    validateTicketByID,
    createTicketForUser,
    updateTicketPaymentStatus,
    updateTicketOrderId,
};
