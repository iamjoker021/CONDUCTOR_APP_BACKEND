require('dotenv').config();
const busStopModel = require("../model/busStopModel");
const ticketModel = require("../model/ticketModel");
const QRCode = require('qrcode');

const getTicketDetailsForUser = async (req, res) => {
    try {
        const userId = req.userId;
        const isValid = parseInt(req.query.isvalid) === 1;
        const ticketList = await ticketModel.getTicketDetailsForUser(userId, isValid);
        for (let index = 0; index < ticketList.length; index++) {
            const url = process.env.SERVER_URL + '/api/user/tickets/' + ticketList[index].ticket_unique_identifier;
            const qrCode = await QRCode.toDataURL(url);
            ticketList[index]['ticket_qr'] = qrCode;
        }
        res.status(200).json({
            ticketList
        })
    }
    catch (err) {
        res.status(500).json({message: err, error: 'Unable to fetch ticket details'});
    }
}

const getTicketDetailsById = async (req, res) => {
    try {
        const ticketId = req.params.ticketid;
        const ticketDetails = await ticketModel.getTicketDetailsById(ticketId);
        for (let index = 0; index < ticketDetails.length; index++) {
            const url = process.env.SERVER_URL + '/users/tickets/' + ticketDetails[index].ticket_unique_identifier;
            const qrCode = await QRCode.toDataURL(url);
            ticketDetails[index]['ticket_qr'] = qrCode;
        }
        if (ticketDetails.length > 0) {
            return res.status(200).json({
                ticketDetails
            })
        }
        else {
            return res.status(400).json({
                error: 'Ticket not found', 
                message: 'Ticket not found, Are you sure ticket ID is correct'
            })
        }
    }
    catch (error) {
        res.status(500).json({message: error, error: 'Unable to fetch ticket details'});
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
    getTicketDetailsById,
    payForTrip
}