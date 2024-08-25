require('dotenv').config();
const busStopModel = require("../model/busStopModel");
const ticketModel = require("../model/ticketModel");
const paymentUtil= require('../config/payment');

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

const validateTicketByID = async (req, res) => {
    try {
        if (req.user_role !== 'conductor') {
            return res.status(401).json({error: 'Only Conductor can validate a ticket', message: 'The given token/user is not valid to validate the ticket'});
        }
        const ticketId = req.params.ticketid;
        const ticketDetails = await ticketModel.getTicketDetailsByID(ticketId);
        if (ticketDetails.length === 1) {
            if (ticketDetails[0].validated_time === null) {
                await ticketModel.validateTicketByID(ticketId);
                return res.status(200).json({message: 'Ticket is marked as validated', ticketDetails: ticketDetails[0]})
            }
            else {
                return res.status(400).json({
                    error: 'The ticket is already validated',
                    message: `Ticket is already validates on ${ticketDetails[0].validated_time}`,
                    ticketDetails: ticketDetails[0]
                })
            }
        }
        else {
            res.status(400).json({
                error: 'Ticket is not found',
                message: 'The ticket ID is not present in DB, are you sure the Ticket ID is correct. The ticket ID is case-sensitive, make sure the case and spelling is correct'
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
            const { ticketId } = await ticketModel.createTicketForUser(userId, tripDetails);
            const paymentResponse = await paymentUtil.createOrderPayment(totalFare*100, ticketId);
            if (paymentResponse.error) {
                ticketModel.updateTicketPaymentStatus(ticketId, 'FAILED');
                return res.status(400).json({
                    message: 'Unable to make payment, Please try again', 
                    error: paymentResponse.error
                })
            }
            await ticketModel.updateTicketOrderId(ticketId, paymentResponse.orderId);
            res.status(200).json({
                message: 'Ticket placed',
                ticketId: paymentResponse.receipt,
                orderId: paymentResponse.orderId,
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

const paymentVerification = async (req, res) => {
    try {
        const ticketId = req.params.ticketid;
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
        const isValidSign = await paymentUtil.validatePaymentSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
        if (isValidSign) {
            ticketModel.updateTicketPaymentStatus(ticketId, 'SUCCESS', razorpay_order_id);
            return res.status(201).json({
                message: 'Payment is successfull', 
                orderId: razorpay_order_id
            })
        }
        else {
            ticketModel.updateTicketPaymentStatus(ticketId, 'FAILED');
            return res.status(401).json({
                error: 'Payment failed, payment signature is not valid', 
                message: 'Payment is failed, payment signature is not valid'
            })
        }
    }
    catch (error) {
        ticketModel.updateTicketPaymentStatus(ticketId, 'FAILED');
        res.status(500).json({message: 'Unable to verify Payment', error: error});
    }
}

module.exports = {
    getTicketDetailsForUser,
    validateTicketByID,
    payForTrip,
    paymentVerification
}