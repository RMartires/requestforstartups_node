const express = require('express');

const router = express.Router();

const menucontoler = require('../controllers/menu');

router.get('/getmenu/:token', menucontoler.postmenu);

module.exports = router;