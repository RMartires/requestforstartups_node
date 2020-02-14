const express = require('express');

const router = express.Router();

const ideacontoler = require('../controllers/idea');

router.post('/addidea', ideacontoler.Postidea);

router.get('/', ideacontoler.getideas);

router.get('/getusers/:userid', ideacontoler.getuser);

router.get('/idea/upvote/:ideaid', ideacontoler.putupvote);

router.get('/idea/getmyideas/:email', ideacontoler.getmyideas);

router.get('/idea/getidea/:ideaid', ideacontoler.getidea);

module.exports = router;