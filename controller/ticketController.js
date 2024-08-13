const busStopModel = require("../model/busStopModel");
const ticketModel = require("../model/ticketModel");

const getTicketDetailsForUser = async (req, res) => {
    try {
        const userId = req.userId;
        const isValid = parseInt(req.query.isvalid) === 1;
        const ticketList = await ticketModel.getTicketDetailsForUser(userId, isValid);
        res.status(200).json({
            ticketList
        })
    }
    catch (err) {
        res.status(500).json({message: err, error: 'Unable to fetch ticket details'});
    }
}

const payForTrip = async (req, res) => {
    try {
        const userId = req.userId;
        const { sourceId, destinationId, busId, noOfPassengers } = req.body;
        const fareInfoList = await busStopModel.validateTripDetails(sourceId, destinationId, busId);

        if (fareInfoList.length === 1) {
            const fareInfo = fareInfoList[0]
            const totalFare = noOfPassengers * parseInt(fareInfo.fare);
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
            res.status(200).json({
                message: 'Ticket placed',
                tripDetails
            })
        }
        else {
            res.status(500).json({ message: 'Invalid Trip Details, not able to generate ticket', error: 'Expected exactly one entry for BusID, sourceId, destinationId' })
        }
    }
    catch (err) {
        res.status(500).json({message: 'Unable to Pay Trip', error: err});
    }
}

module.exports = {
    getTicketDetailsForUser,
    payForTrip
}