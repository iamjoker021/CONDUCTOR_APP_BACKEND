require('dotenv').config();
const busStopModel = require("../model/userModel");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const addUser = async (req, res) => {
    const { name, email, password, phoneno, role } = req.body;
    const user = await busStopModel.getUserDetailsByUsername(email);
    if (user.length !== 0) {
        res.status(400).json({msg: 'Unable to register user', 'err': 'Given Username/Email already exits'});
    }
    try {
        const PASS_SALT = parseInt(process.env.PASS_SALT) || 10;
        const password_hash = await bcrypt.hash(password, PASS_SALT);
        await busStopModel.addUser(name, email, password_hash, phoneno, role);
        res.json({
            'msg': 'Sucessfully added user'
        });
    }
    catch (err) {
        res.status(500).json({'msg': 'Unable to register user', 'err': err});
    }
}

const validateUser = async (req, res) => {
    const { email, password } = req.body;
    const userList = await busStopModel.getUserDetailsByUsername(email);
    if (userList.length !== 1) {
        res.status(401).json({ error: 'Authentication failed', 'msg': 'Either username is invalid/User is not registered yet' });
    }
    const user = userList[0];
    const isPasswordCorrect = await bcrypt.compare(password, user.password_hash);
    if (isPasswordCorrect) {
        const AUTH_SECRET = process.env.AUTH_SECRET;
        const token = jwt.sign({ userId: user.id }, AUTH_SECRET, { expiresIn: '1h', });
        res.json({ token });
    }
    else {
        res.status(401).json({ error: 'Authentication failed', 'msg': 'Password is incorrect' });
    }
}

const verifyToken = (req, res, next) => {
    const bearerToken = req.header('Authorization');
    if (!bearerToken) {
        return res.status(401).json({ error: 'Access denied' })
    };
    try {
        const AUTH_SECRET = process.env.AUTH_SECRET;
        const token = bearerToken.split(' ')[1];
        const decoded = jwt.verify(token, AUTH_SECRET);
        req.userId = decoded.userId;
        next();
    } 
    catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
}

module.exports = {
    addUser,
    validateUser,
    verifyToken
}