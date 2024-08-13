const busStopModel = require("../model/busStopModel")

const getStopsFromBusId = async (req, res) => {
    try {
        const busId = req.params.bus_id;
        const busStopsDetails = await busStopModel.getStopsFromBusId(busId);
        if (busStopsDetails.length > 0) {
            return res.status(200).json({
                busStopsDetails
            })
        }
        else {
            return res.status(400).json({
                error: 'No details found for given BusID, are you sure given busId is correct',
                message: 'Unable to fetch bust stop details'
            })
        }
    } 
    catch (err) {
        res.status(500).json({message: err, error: 'Unable to receive Bus Stop info'});
    }
}

module.exports = {
    getStopsFromBusId
}