const { Router } = require('express');
const authController = require('../controller/authController');
const { validate, registerValidation, loginValidation } = require('../config/validator');

const authRouter = Router();

authRouter.post('/register', registerValidation, validate, authController.addUser);
authRouter.post('/login', loginValidation, validate, authController.validateUser);

module.exports = {
    authRouter
};