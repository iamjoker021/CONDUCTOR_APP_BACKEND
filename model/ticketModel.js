const pool = require("../config/db");

const getTicketDetailsForUser = async (userId, isValid) => {
    let getTicketQ;
    if (isValid) {
        // Get only valid non expired tickets
        const getTicketQ = `
        SELECT * 
        FROM tickets 
        WHERE user_id = $1 
        AND is_valid = true 
        AND expiry_time > current_time()
        ORDER BY issue_time desc
        `
        
    }
    else {
        // Get alld tickets
        const getTicketQ =  `
        SELECT * 
        FROM tickets 
        WHERE user_id = $1 
        ORDER BY issue_time DESC
        `
    }
    const { rows } = pool.query(getTicketQ, [userId]);
    return rows;
}

module.exports = {
    getTicketDetailsForUser
}