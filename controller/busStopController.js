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

module.exports = {
    getAllCity
}