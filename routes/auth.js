const express = require('express');
const { check, body } = require('express-validator');

const router = express.Router();

const authControler = require('../controllers/auth');

router.post('/signup', [
    body('email')
        .isEmail()
        .withMessage('Please enter a valid email address.')
        .normalizeEmail(),
    body('password', 'Password min length 8')
        .isLength({ min: 8 })
        .isAlphanumeric()
        .trim()
], authControler.postSignup);

router.post('/login', [
    body('email')
        .isEmail()
        .withMessage('Please enter a valid email address.')
        .normalizeEmail(),
    body('password', 'Password has to be valid')
        .isLength({ min: 8 })
        .isAlphanumeric()
        .trim()
], authControler.postLogin)

module.exports = router;