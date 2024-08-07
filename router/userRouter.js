const { Router } = require("express");
const ticketController = require("../controller/ticketController");

const userRouter = Router();

userRouter.get('/tickets', ticketController.getTicketDetailsForUser)

module.exports = userRouter;