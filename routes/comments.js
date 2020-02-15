const express = require('express');

const router = express.Router();

const commentscontroler = require('../controllers/comments');

router.get('/comments/:ideaid', commentscontroler.getcommments);

router.post('/comments/:ideaid', commentscontroler.postcomments);

module.exports = router;