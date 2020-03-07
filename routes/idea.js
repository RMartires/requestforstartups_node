const express = require('express');

const router = express.Router();

const ideacontoler = require('../controllers/idea');

router.post('/addidea', ideacontoler.Postidea);

router.get('/', ideacontoler.getideas);

router.post('/idea/upvote/:ideaid', ideacontoler.putupvote);

router.get('/idea/filterideas/:domain', ideacontoler.getfilteredideas);

router.get('/idea/orderideas/:type', ideacontoler.getorderideas);

router.get('/idea/getidea/:ideaid', ideacontoler.getidea);

module.exports = router;