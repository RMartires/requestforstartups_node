const express = require('express');

const router = express.Router();

const twittercontroller = require('../controllers/twitter');

router.get('/twitter/gettweets', twittercontroller.gettweets);

module.exports = router;