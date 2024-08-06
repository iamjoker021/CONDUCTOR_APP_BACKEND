const { Router } = require("express");
const busStopController = require("../controller/busStopController");

const busStopRouter = Router();

busStopRouter.get('/city', busStopController.getAllCity)
busStopRouter.get('/city/:city_id/source-stop', busStopController.getAllStopsForCity)
busStopRouter.get('/city/:city_id/source-stop/:source_id/destination', busStopController.getAllPossibleDestinationFromSource)
busStopRouter.get('/city/:city_id/source-stop/:source_id/destination/destination_id', busStopController.getBustListForChoosenPath)

module.exports = busStopRouter;