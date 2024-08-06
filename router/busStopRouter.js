const { Router } = require("express");
const busStopController = require("../controller/busStopController");

const busStopRouter = Router();

busStopRouter.get('/city', busStopController.getAllCity)

module.exports = busStopRouter;