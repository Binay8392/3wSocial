const express = require('express');
const {
  getPosts,
  getPostById,
  createPost,
  deletePost,
  toggleLike,
  commentOnPost,
} = require('../controllers/postController');
const { protect, optionalAuth } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

// GET /api/posts — public feed (pagination, optional auth for liked state)
router.get('/', optionalAuth, getPosts);

// GET /api/posts/:id — public single post
router.get('/:id', optionalAuth, getPostById);

// POST /api/posts — create a post (auth required, multipart image)
router.post('/', protect, upload.single('image'), createPost);

// DELETE /api/posts/:id — delete a post (owner only)
router.delete('/:id', protect, deletePost);

// POST /api/posts/:id/like — toggle like/unlike
router.post('/:id/like', protect, toggleLike);

// POST /api/posts/:id/comment — add a comment
router.post('/:id/comment', protect, commentOnPost);

module.exports = router;
