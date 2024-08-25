const ticketController = require("../ticketController");
const ticketModel = require("../../model/ticketModel");
const busStopModel = require("../../model/busStopModel");
const paymentUtil = require('../../config/payment');

jest.mock('../../model/ticketModel');
jest.mock('../../model/busStopModel');
jest.mock('../../config/payment');

describe('getTicketDetailsForUser', () => {
    it('should return 200 on giving correct userId', async () => {
        const mockResponse =  [ { "ticket_id": 0, "ticket_unique_identifier": "string", "issue_time": "2024-08-13T07:38:21.728Z", "expiry_time": "2024-08-13T07:38:21.728Z", "trip_details": {"bus_id": 0,"source_stop_id": 0,"destination_stop_id": 0,"total_distance": 0,"price_per_km": 0,"no_of_passengers": 0,"fare": 0}, "is_valid": true, "user_id": 0 } ];
        ticketModel.getTicketDetailsForUser.mockResolvedValue(mockResponse);

        const req = { userId: 1, query: {} };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        await ticketController.getTicketDetailsForUser(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({'ticketList': mockResponse});
    });
})

describe('payForTrip', () => {
    it('should return 200 for valid source, destination, busId and payment confirmed', async () => {
        busStopModel.validateTripDetails.mockResolvedValue([{'bus_id': 1, 'price_per_km': 2, 'total_distance': 3, 'fare': 6}]);
        ticketModel.createTicketForUser = jest.fn().mockResolvedValue({ticketId: 'UNIQUE_TIKCET_ID'});
        paymentUtil.createOrderPayment.mockResolvedValue({orderId: 'UNIQUE_ORDER_ID', receipt: 'UNIQUE_TIKCET_ID'});
        ticketModel.updateTicketOrderId = jest.fn();

        const req = { userId: 1, body: {sourceId: 1, destinationId: 2, busId: 1, noOfPassengers: 4} };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        await ticketController.payForTrip(req, res);
        expect(ticketModel.createTicketForUser).toHaveBeenCalled();
        expect(ticketModel.updateTicketOrderId).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({message: 'Ticket placed', ticketId: 'UNIQUE_TIKCET_ID', orderId: 'UNIQUE_ORDER_ID',tripDetails: { 'bus_id': 1, 'source_stop_id': 1, 'destination_stop_id': 2, 'total_distance': 3, 'price_per_km': 2, 'no_of_passengers': 4, 'fare': 24 }});
    });

    it('should return 500, if mutiple fareInfo received, ', async () => {
        busStopModel.validateTripDetails.mockResolvedValue([
            {'bus_id': 1, 'price_per_km': 2, 'total_distance': 3, 'fare': 6},
            {'bus_id': 2, 'price_per_km': 2, 'total_distance': 3, 'fare': 6}
        ]);
        ticketModel.createTicketForUser = jest.fn();

        const req = { userId: 1, body: {sourceId: 1, destinationId: 2, busId: 1, noOfPassengers: 4} };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        await ticketController.payForTrip(req, res);
        expect(ticketModel.createTicketForUser).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Invalid Trip Details, not able to generate ticket', 
            error: 'Expected exactly one entry for BusID, sourceId, destinationId'
        });
    })

    it('should return 400 for payment failed', async () => {
        const error = {"code": "BAD_REQUEST_ERROR", "step": "payment_initiation", "description": "The amount must be atleast INR 1.00",};
        busStopModel.validateTripDetails.mockResolvedValue([{'bus_id': 1, 'price_per_km': 2, 'total_distance': 3, 'fare': 6}]);
        ticketModel.createTicketForUser = jest.fn().mockResolvedValue({ticketId: 'UNIQUE_TIKCET_ID'});
        paymentUtil.createOrderPayment.mockResolvedValue({error: error});
        ticketModel.updateTicketPaymentStatus = jest.fn();

        const req = { userId: 1, body: {sourceId: 1, destinationId: 2, busId: 1, noOfPassengers: 4} };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        await ticketController.payForTrip(req, res);
        expect(ticketModel.createTicketForUser).toHaveBeenCalled();
        expect(ticketModel.updateTicketPaymentStatus).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({message: 'Unable to make payment, Please try again', error: error});
    });
})

describe('validateTicketByID', () => {
    it('should return 200 on giving corerect ticket id', async () => {
        const mockResponse = [{
            'ticket_unique_identifier': 'mockticketid',
            'issue_time': 'mock issue time',
            'expiry_time': 'mock expiry time',
            'trip_details': { "bus_id": 0, "source_stop_id": 0, "destination_stop_id": 0, "total_distance": 0, "price_per_km": 0, "no_of_passengers": 0, "fare": 0 },
            'validated_time': null,
            'user_id': 1
        }]
        ticketModel.getTicketDetailsByID.mockResolvedValue(mockResponse);
        ticketModel.validateTicketByID.mockResolvedValue();

        req = { params: {ticketId: 'mockticketid'}, user_role: 'conductor' };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }
        await ticketController.validateTicketByID(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({message: 'Ticket is marked as validated', ticketDetails: mockResponse[0]});
    })

    it('should throw 400 error if ticket if is not present in the DB', async () => {
        ticketModel.getTicketDetailsByID.mockResolvedValue([]);

        req = { params: {ticketId: 'mockticketid'}, user_role: 'conductor' };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }
        await ticketController.validateTicketByID(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: 'Ticket is not found', message: 'The ticket ID is not present in DB, are you sure the Ticket ID is correct. The ticket ID is case-sensitive, make sure the case and spelling is correct' });
    })

    it('should throw 400 error if ticket is already validated', async () => {
        const mockResponse = [{
            'ticket_unique_identifier': 'mockticketid',
            'issue_time': 'mock issue time',
            'expiry_time': 'mock expiry time',
            'trip_details': { "bus_id": 0, "source_stop_id": 0, "destination_stop_id": 0, "total_distance": 0, "price_per_km": 0, "no_of_passengers": 0, "fare": 0 },
            'validated_time': "2024-08-15",
            'user_id': 1
        }]
        ticketModel.getTicketDetailsByID.mockResolvedValue(mockResponse);
        ticketModel.validateTicketByID.mockResolvedValue();

        req = { params: {ticketId: 'mockticketid'}, user_role: 'conductor' };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }
        await ticketController.validateTicketByID(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({error: 'The ticket is already validated',message: `Ticket is already validates on ${mockResponse[0].validated_time}`, ticketDetails: mockResponse[0]});
    })

    it('should throw 401 error if user is not conductor', async () => {
        req = { params: {ticketId: 'mockticketid'} };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }
        await ticketController.validateTicketByID(req, res);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({error: 'Only Conductor can validate a ticket', message: 'The given token/user is not valid to validate the ticket'});
    })
})

describe('paymentVerification', () => {
    it('should return 201 if payment is success', async () => {
        paymentUtil.validatePaymentSignature.mockResolvedValue(true);
        req = { params: {ticketId: 'UNIQUE_TIKCET_ID'},body: {razorpay_order_id: 'UNIQUE_ORDER_ID', razorpay_payment_id: 'UNIQUE_PAY_ID', razorpay_signature: 'SIGN'} };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }
        await ticketController.paymentVerification(req, res);
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({message: 'Payment is successfull', orderId: 'UNIQUE_ORDER_ID'});
    });

    it('should return 401 if payment is failure/signature not valid', async () => {
        paymentUtil.validatePaymentSignature.mockResolvedValue(false);
        req = { params: {ticketId: 'UNIQUE_TIKCET_ID'},body: {razorpay_order_id: 'UNIQUE_ORDER_ID', razorpay_payment_id: 'UNIQUE_PAY_ID', razorpay_signature: 'SIGN'} };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }
        await ticketController.paymentVerification(req, res);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({error: 'Payment failed, payment signature is not valid', message: 'Payment is failed, payment signature is not valid'});
    });
})