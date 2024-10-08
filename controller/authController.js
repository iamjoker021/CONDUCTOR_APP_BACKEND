require('dotenv').config();
const userModel = require("../model/userModel");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const addUser = async (req, res) => {
    const { name, email, password, phoneno, role } = req.body;
    try {
        const PASS_SALT = parseInt(process.env.PASS_SALT) || 10;
        const password_hash = await bcrypt.hash(password, PASS_SALT);
        await userModel.addUser(name, email, password_hash, phoneno, role);
        res.status(200).json({
            message: 'Sucessfully added user'
        });
    }
    catch (error) {
        if (error.message.includes('UNIQUE constraint failed: users.phoneno')) {
            return res.status(400).json({error: 'Given phoneno already exists', message: 'Unable to register user'});
        }
        else if (error.message.includes('UNIQUE constraint failed: users.email')) {
            return res.status(400).json({error: 'Given EmailID already exists', message: 'Unable to register user'});
        }
        res.status(500).json({message: error.message, error: 'Unable to register user'});
    }
}

const validateUser = async (req, res) => {
    const { email, password } = req.body;
    const userList = await userModel.getUserDetailsByUsername(email);
    try {
        if (userList.length === 0) {
            return res.status(401).json({ error: 'Either username is invalid/User is not registered yet', message: 'Authentication failed' });
        }
        else if (userList.length !== 1) {
            throw new Error('Internal error, Only one user should exists, but multiple user exists');
        }
        const user = userList[0];
        const isPasswordCorrect = await bcrypt.compare(password, user.password_hash);
        if (isPasswordCorrect) {
            const AUTH_SECRET = process.env.AUTH_SECRET;
            const tokenExpireDuration = parseInt(process.env.TOKEN_EXPIRY_DURATION || (5 * 60))
            const token = await jwt.sign({ userId: user.id, role: user.role }, AUTH_SECRET, { expiresIn: tokenExpireDuration, });
            res.status(200).json({ token: token, username: user.email, role: user.role });
        }
        else {
            res.status(401).json({ error: 'Password is incorrect', message: 'Authentication failed' });
        }
    }
    catch (error) {
        res.status(500).json({ error: 'Unexpected Error', message: 'Internal error, Only one user should exists, but multiple user exists' });
    }
}

const verifyToken = (req, res, next) => {
    const bearerToken = req.header('Authorization');
    if (!bearerToken) {
        return res.status(401).json({ error: 'Access denied, token is not present', message: 'Token not available' });
    };
    try {
        const AUTH_SECRET = process.env.AUTH_SECRET;
        const token = bearerToken.split(' ')[1];
        const decoded = jwt.verify(token, AUTH_SECRET);
        req.userId = decoded.userId;
        req.user_role = decoded.role;
        next();
    } 
    catch (error) {
        return res.status(401).json({ error: 'Invalid token', message: 'The given token is not valid' });
    }
}

module.exports = {
    addUser,
    validateUser,
    verifyToken
}