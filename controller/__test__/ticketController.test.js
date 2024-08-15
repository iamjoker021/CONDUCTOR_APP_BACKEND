const ticketController = require("../ticketController");
const ticketModel = require("../../model/ticketModel");
const busStopModel = require("../../model/busStopModel");
const QRCode = require('qrcode');

jest.mock('../../model/ticketModel');
jest.mock('../../model/busStopModel');
jest.mock('qrcode');

describe('getTicketDetailsForUser', () => {
    it('should return 200 on giving correct userId', async () => {
        const mockResponse =  [ { "ticket_id": 0, "ticket_unique_identifier": "string", "issue_time": "2024-08-13T07:38:21.728Z", "expiry_time": "2024-08-13T07:38:21.728Z", "trip_details": {"bus_id": 0,"source_stop_id": 0,"destination_stop_id": 0,"total_distance": 0,"price_per_km": 0,"no_of_passengers": 0,"fare": 0}, "is_valid": true, "user_id": 0 } ];
        ticketModel.getTicketDetailsForUser.mockResolvedValue(mockResponse);
        QRCode.toDataURL.mockResolvedValue('QR_CODE_IMAGE');

        const req = { userId: 1, query: {} };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        await ticketController.getTicketDetailsForUser(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
        mockResponse[0]['ticket_qr'] = 'QR_CODE_IMAGE';
        expect(res.json).toHaveBeenCalledWith({'ticketList': mockResponse});
    });
})

describe('payForTrip', () => {
    it('should return 200 for valid source, destination, busId', async () => {
        busStopModel.validateTripDetails.mockResolvedValue([{'bus_id': 1, 'price_per_km': 2, 'total_distance': 3, 'fare': 6}]);
        ticketModel.createTicketForUser = jest.fn();

        const req = { userId: 1, body: {sourceId: 1, destinationId: 2, busId: 1, noOfPassengers: 4} };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        await ticketController.payForTrip(req, res);
        expect(ticketModel.createTicketForUser).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({message: 'Ticket placed', tripDetails: { 'bus_id': 1, 'source_stop_id': 1, 'destination_stop_id': 2, 'total_distance': 3, 'price_per_km': 2, 'no_of_passengers': 4, 'fare': 24 }});
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
        expect(res.json).toHaveBeenCalledWith({message: 'Ticket is marked as validated'});
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
        expect(res.json).toHaveBeenCalledWith({error: 'The ticket is already validated',message: `Ticket is already validates on ${mockResponse.validated_time}`});
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