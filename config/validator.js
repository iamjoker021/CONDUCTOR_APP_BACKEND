const { body, validationResult } = require('express-validator');

const registerValidation = [
    body('name')
    .trim()
    .notEmpty()
    .withMessage('Name should not be empty')
    .escape()
    .custom((name, req) => {
        if (/^[a-z .]+$/i.test(name)) {
            return true;
        }
        throw new Error('Name should contains only alphabets');
    }),
    body('email')
    .trim()
    .notEmpty()
    .withMessage('Email/Username should not be empty')
    .isEmail()
    .withMessage('Should be valid email Id'),
    body('password')
    .trim()
    .notEmpty()
    .withMessage('Password should not be empty')
    .custom(password => {
        if (/^[a-zA-Z0-9 .+@!]+$/.test(password)) {
            return true;
        }
        throw new Error('Password should contains valid charatcers. Valid Character: [a-zA-Z0-9 .+@!]');
    }),
    body('confirm_password')
    .custom((confirm_password, { req }) => {
        if (confirm_password === req.body.password) {
            return true;
        }
        throw new Error('Password and Confirm Password should match');
    }),
    body('phoneno')
    .trim()
    .notEmpty()
    .withMessage('PhoneNo should not be empty')
    .escape()
    .custom((phoneno) => {
        if (/^[0-9]+$/.test(phoneno)) {
            return true;
        }
        throw new Error('PhoneNo should contains only Numbers');
    }),
    body('role')
    .trim()
    .notEmpty()
    .withMessage('Role must be present')
    .custom(role => {
        if (['passenger', 'conductor'].includes(role)) {
            return true;
        }
        throw new Error('Valid user role should be given');
    })
];

const loginValidation = [
    body('email')
    .trim()
    .notEmpty()
    .withMessage('Email/Username should not be empty')
    .isEmail()
    .withMessage('Should be valid email Id'),
    body('password')
    .trim()
    .notEmpty()
    .withMessage('Password should not be empty')
    .custom(password => {
        if (/^[a-zA-Z0-9 .+@!]+$/.test(password)) {
            return true;
        }
        throw new Error('Password should contains valid charatcers. Valid Character: [a-zA-Z0-9 .+@!]');
    })
]

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            'msg': 'Invalid Input, validation failed. Please check errors for more info',
            errors
        });
    }
    next();
}

module.exports = {
    registerValidation,
    loginValidation,
    validate
}