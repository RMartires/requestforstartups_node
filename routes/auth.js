const express = require('express');

const router = express.Router();

const authControler = require('../controllers/auth');

router.post('/signup', authControler.postSignup);

router.post('/login', authControler.postLogin)

module.exports = router;