const { Router } = require('express');
const authController = require('../controller/authController');
const ticketController = require("../controller/ticketController");
const { validate, registerValidation, loginValidation } = require('../config/validator');

const authRouter = Router();

authRouter.post('/register', registerValidation, validate, authController.addUser);
authRouter.post('/login', loginValidation, validate, authController.validateUser);
authRouter.post('/tickets/:ticketid/verify', ticketController.paymentVerification);

module.exports = {
    authRouter,
    verifyToken: authController.verifyToken
};