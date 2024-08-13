require('dotenv').config();
const authController = require("../authController");
const userModel = require("../../model/userModel");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

jest.mock('bcryptjs');
jest.mock('../../model/userModel');
jest.mock('jsonwebtoken');

describe('addUser', () => {
    it('should return 200 on valid user and password', async () => {
        bcrypt.hash.mockResolvedValue('hashed_password');
        userModel.addUser.mockReturnThis();

        const req = { body: {name: 'abc', email: 'abc@gmail.com', password: 'jerry', phoneno: '123456789', role: 'passenger'} }
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }
        await authController.addUser(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({message: 'Sucessfully added user'});
    })

    it('should return 400 on duplicate phoneno registration', async () => {
        bcrypt.hash.mockResolvedValue('hashed_password');
        userModel.addUser.mockRejectedValue(new Error('UNIQUE constraint failed: users.phoneno'));

        const req = { body: {name: 'abc', email: 'abc@gmail.com', password: 'jerry', phoneno: '123456789', role: 'passenger'} }
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }
        await authController.addUser(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({error: 'Given phoneno already exists', message: 'Unable to register user'});
    })

    it('should return 400 on duplicate Email registration', async () => {
        bcrypt.hash.mockResolvedValue('hashed_password');
        userModel.addUser.mockRejectedValue(new Error('UNIQUE constraint failed: users.email'));

        const req = { body: {name: 'abc', email: 'abc@gmail.com', password: 'jerry', phoneno: '123456789', role: 'passenger'} }
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }
        await authController.addUser(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({error: 'Given EmailID already exists', message: 'Unable to register user'});
    })
})

describe('validateUser', () => {
    test('should return 200 if email and password is valid', async () => {
        userModel.getUserDetailsByUsername.mockResolvedValue([
            { "name": "John Doe", "email": "john.doe@example.com", "password": "Password123", "phoneno": "1234567890", "role": "passenger" },
        ])
        bcrypt.compare.mockResolvedValue(true);
        jwt.sign.mockResolvedValue('mocktoken');

        const req = { body: {email: 'abc@gmail.com', password: 'jerry'} }
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }
        await authController.validateUser(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ token: 'mocktoken', username: 'john.doe@example.com' });
    })

    test('should return 401 if password is not valid', async () => {
        userModel.getUserDetailsByUsername.mockResolvedValue([
            { "name": "John Doe", "email": "john.doe@example.com", "password": "Password123", "phoneno": "1234567890", "role": "passenger" },
        ])
        bcrypt.compare.mockResolvedValue(false);

        const req = { body: {email: 'abc@gmail.com', password: 'jerry'} }
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }
        await authController.validateUser(req, res);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error: 'Password is incorrect', message: 'Authentication failed' });
    })

    test('should return 401 if username is availables', async () => {
        userModel.getUserDetailsByUsername.mockResolvedValue([])

        const req = { body: {email: 'abc@gmail.com', password: 'jerry'} }
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }
        await authController.validateUser(req, res);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error: 'Either username is invalid/User is not registered yet', message: 'Authentication failed' });
    })

    test('should return 500 if mutiple username is available', async () => {
        userModel.getUserDetailsByUsername.mockResolvedValue([
            { "name": "John Doe", "email": "john.doe@example.com", "password": "Password123", "phoneno": "1234567890", "role": "passenger" },
            { "name": "John Doe", "email": "john1.doe@example.com", "password": "Password123", "phoneno": "12345678900", "role": "passenger" },
        ])

        const req = { body: {email: 'abc@gmail.com', password: 'jerry'} }
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }
        await authController.validateUser(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Unexpected Error', message: 'Internal error, Only one user should exists, but multiple user exists' });
    })
})

describe('verifyToken', () => {
    it('should call next if token is valid', () => {
        jwt.verify.mockResolvedValue({userId: 1});

        req = { header: jest.fn().mockReturnValue('Bearer token') };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }
        next = jest.fn();
        authController.verifyToken(req, res, next);
        expect(next).toHaveBeenCalled();
    })

    it('should return 401 if token is not present', () => {
        jwt.verify.mockResolvedValue({userId: 1});
        req = { header: jest.fn() };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }
        next = jest.fn();
        authController.verifyToken(req, res, next);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({error: 'Access denied, token is not present', message: 'Token not available' })
        expect(next).not.toHaveBeenCalled();
    })

    it('should return 401 if token is not valid', async () => {
        jwt.verify.mockImplementation(() => {new Error('some error')});
        req = { header: jest.fn().mockReturnValue('Bearers token') };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        }
        next = jest.fn();
        await authController.verifyToken(req, res, next);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error: 'Invalid token', message: 'The given token is not valid' })
        expect(next).not.toHaveBeenCalled();
    })
    
})