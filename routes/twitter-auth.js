const express = require('express');

const router = express.Router();

const twiiter_authcontroler = require('../controllers/twitter-auth');

router.get('/auth/twitter/reverse', twiiter_authcontroler.getrequesttoken);

router.get('/auth/twitter/cb/', twiiter_authcontroler.Oauthcb);


module.exports = router;