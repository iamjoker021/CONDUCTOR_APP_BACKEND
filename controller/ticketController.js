const busStopModel = require("../model/ticketModel");

const getTicketDetailsForUser = async (req, res) => {
    try {
        const userId = req.userId;
        const isValid = req.query.isvalid === 1;
        const ticketList = await busStopModel.getTicketDetailsForUser(userId, isValid);
        res.json({
            ticketList
        })
    }
    catch (err) {
        res.status(500).json({'msg': 'Unable to fetch ticket details', 'error': err});
    }
}

module.exports = {
    getTicketDetailsForUser
}