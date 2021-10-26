const express = require('express');
const router = express.Router();
const { postMulti } = require('../controllers/multi-post');
const { postComment } = require('../controllers/comment');

router.post('/:multi_id/comment', postComment); // 댓글 
router.post('/', postMulti);  // 객관식 게시글 작성

module.exports = router;