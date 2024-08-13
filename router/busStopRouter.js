const { Router } = require("express");
const busStopController = require("../controller/busStopController");

const busStopRouter = Router();

busStopRouter.get('/bus/:bus_id', busStopController.getStopsFromBusId);

module.exports = busStopRouter;