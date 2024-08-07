const { Router } = require('express');
const authController = require('../controller/authController');

const authRouter = Router();

authRouter.post('/register', authController.addUser);
authRouter.post('/login', authController.validateUser);

module.exports = {
    authRouter
};