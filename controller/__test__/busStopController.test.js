const busStopController = require("../busStopController");
const busStopModel = require("../../model/busStopModel");

jest.mock('../../model/busStopModel');

describe('getStopsFromBusId', () => {
    it('should return 200 status on giving correct busId', async () => {
        const mockResponse = [{"bus_id": 1,"route_id": 1,"price": 3,"stop_details": [{ "stop_id": 1, "stop_name": "Times Square", "stop_order": 1, "distance_from_start": 0 },]}]
        busStopModel.getStopsFromBusId.mockResolvedValue(mockResponse);

        const req = { params: { bus_id: 1 } };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        
        await busStopController.getStopsFromBusId(req, res);
        
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({"busStopsDetails": mockResponse});
    });

    it('should return 400 if given bus details is not present', async () => {
        busStopModel.getStopsFromBusId.mockResolvedValue([]);

        const req = { params: { bus_id: 1 } };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        await busStopController.getStopsFromBusId(req, res);
        
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: 'No details found for given BusID, are you sure given busId is correct', message: 'Unable to fetch bust stop details' });
    })
})
