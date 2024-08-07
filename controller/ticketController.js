const busStopModel = require("../model/busStopModel");
const ticketModel = require("../model/ticketModel");

const getTicketDetailsForUser = async (req, res) => {
    try {
        const userId = req.userId;
        const isValid = req.query.isvalid === 1;
        const ticketList = await ticketModel.getTicketDetailsForUser(userId, isValid);
        res.json({
            ticketList
        })
    }
    catch (err) {
        res.status(500).json({'msg': 'Unable to fetch ticket details', 'error': err});
    }
}

const payForTrip = async (req, res) => {
    try {
        const userId = req.userId;
        const { sourceId, destinationId, busId, noOfPassengers } = req.body;
        const fareInfo = await busStopModel.validateTripDetails(sourceId, destinationId, busId);

        if (fareInfo.length === 1) {
            const totalFare = noOfPassengers * parseInt(fareInfo[0].fare);
            const tripDetails = {
                bus_id: fareInfo.bus_id,
                source_stop_id: sourceId,
                destination_stop_id: destinationId,
                total_distance: fareInfo.total_distance,
                price_per_km: fareInfo.price_per_km,
                no_of_passengers: noOfPassengers,
                fare: totalFare
            }
            await ticketModel.createTicketForUser(userId, tripDetails);
            res.json({
                'msg': 'Ticket placed',
                tripDetails
            })
        }
        else {
            res.status(404).json({ 'msg': 'Invalid Trip Details, not able to generate ticket' })
        }
    }
    catch (err) {
        throw err;
        res.status(500).json({'msg': 'Unable to Pay Trip', 'error': err});
    }
}

module.exports = {
    getTicketDetailsForUser,
    payForTrip
}