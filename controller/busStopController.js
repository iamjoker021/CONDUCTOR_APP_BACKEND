const busStopModel = require("../model/busStopModel")

const getAllCity = async (req, res) => {
    try {
        const cityList = await busStopModel.getAllCity();
        res.json({
            city_list: cityList
        })
    }
    catch (err) {
        res.status(500).json({'msg': 'Unable to receive City List', 'error': err});
    }
}

const getAllStopsForCity = async (req, res) => {
    try {
        const cityId = req.params.city_id;
        const stopList = await busStopModel.getAllStopsForCity(cityId);
        res.json({
            source_stops: stopList
        })
    }
    catch (err) {
        res.status(500).json({'msg': 'Unable to receive City List', 'error': err});
    }
}

const getAllPossibleDestinationFromSource = async (req, res) => {
    try {
        const sourceId = req.params.source_id;
        const destinationStops = await busStopModel.getAllPossibleDestinationFromSource(sourceId);
        res.json({
            destination_stop: destinationStops
        })
    }
    catch (err) {
        res.status(500).json({'msg': 'Unable to receive City List', 'error': err});
    }
    
}

module.exports = {
    getAllCity,
    getAllStopsForCity,
    getAllPossibleDestinationFromSource
}