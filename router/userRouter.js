const { Router } = require("express");
const ticketController = require("../controller/ticketController");
const { validate, payForTripValidation } = require('../config/validator');

const userRouter = Router();

userRouter.get('/tickets', ticketController.getTicketDetailsForUser);
userRouter.post('/pay-for-trip', payForTripValidation, validate, ticketController.payForTrip);

module.exports = userRouter;