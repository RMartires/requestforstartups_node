const express = require('express');

const router = express.Router();

const commentscontroler = require('../controllers/comments');

router.get('/comments/:ideaid', commentscontroler.getcommments);

router.post('/comments/:ideaid', commentscontroler.postcomments);

router.post('/comments/upvote/:ideaid', commentscontroler.putupvote);

module.exports = router;