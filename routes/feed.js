const express = require('express');
const { body } = require('express-validator');

const feedControllers = require('../controllers/feed');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.get('/posts', isAuth, feedControllers.getPosts);
router.post('/post', [
    body('title').trim().isLength({ min: 5 }),
    body('content').trim().isLength({ min: 5 }),
], isAuth, feedControllers.createPost);

router.get('/post/:postId', isAuth, feedControllers.getPost);

router.put('/post/:postId', [
    body('title').trim().isLength({ min: 5 }),
    body('content').trim().isLength({ min: 5 }),
], isAuth, feedControllers.updatePost);

router.delete('/post/:postId', isAuth, feedControllers.deletePost);

module.exports = router;