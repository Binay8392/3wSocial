const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Post = require('../models/Post');
const asyncHandler = require('../utils/asyncHandler');
const {
  isCloudinaryConfigured,
  uploadImage,
} = require('../utils/cloudinary');

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');

const EXT_BY_MIMETYPE = {
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

// Resolve the final image URL. Uses Cloudinary in production, and falls back
// to serving the file from /uploads during local development when Cloudinary
// credentials are not configured.
const resolveImageUrl = async (file, req) => {
  if (!file) return '';

  try {
    if (isCloudinaryConfigured()) {
      try {
        return await uploadImage(file.buffer);
      } catch (error) {
        console.warn('Cloudinary upload failed, falling back to local storage:', error.message);
      }
    }

    const ext = EXT_BY_MIMETYPE[file.mimetype] || '';
    const filename = `post-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;

    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    await fs.promises.writeFile(path.join(UPLOAD_DIR, filename), file.buffer);

    return `${req.protocol}://${req.get('host')}/uploads/${filename}`;
  } catch (error) {
    const message = error && error.message ? error.message : 'Image upload failed.';
    throw new Error(`Image upload failed: ${message}`);
  }
};

// @desc Get all posts (public feed) with pagination
// @route GET /api/posts
// @access Public
const getPosts = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const totalPosts = await Post.countDocuments();
  const posts = await Post.find().sort({ createdAt: -1 }).skip(skip).limit(limit);

  if (req.user) {
    posts.forEach((post) => {
      post.likedByCurrentUser = post.likes.some(
        (like) => like.userId.toString() === req.user.id
      );
    });
  }

  const totalPages = Math.ceil(totalPosts / limit);

  res.status(200).json({
    success: true,
    message: 'Posts fetched successfully',
    data: {
      posts,
      pagination: {
        page,
        limit,
        totalPosts,
        totalPages,
        hasNextPage: page < totalPages,
      },
    },
  });
});

// @desc Get a single post by ID
// @route GET /api/posts/:id
// @access Public
const getPostById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    res.status(400);
    throw new Error('Invalid post ID');
  }

  const post = await Post.findById(id);

  if (!post) {
    res.status(404);
    throw new Error('Post not found');
  }

  if (req.user) {
    post.likedByCurrentUser = post.likes.some(
      (like) => like.userId.toString() === req.user.id
    );
  }

  res.status(200).json({
    success: true,
    message: 'Post fetched successfully',
    data: { post },
  });
});

// @desc Create a new post
// @route POST /api/posts
// @access Private
const createPost = asyncHandler(async (req, res) => {
  const text = (req.body.text || '').trim();
  let image = '';

  if (req.file) {
    image = await resolveImageUrl(req.file, req);
  }

  if (!text && !image) {
    res.status(400);
    throw new Error('Post must contain text, an image, or both');
  }

  const post = await Post.create({
    user: {
      userId: req.user.id,
      username: req.user.username,
    },
    text,
    image,
  });

  post.likedByCurrentUser = false;

  res.status(201).json({
    success: true,
    message: 'Post created successfully',
    data: { post },
  });
});

// @desc Delete a post (owner only)
// @route DELETE /api/posts/:id
// @access Private
const deletePost = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    res.status(400);
    throw new Error('Invalid post ID');
  }

  const post = await Post.findById(id);

  if (!post) {
    res.status(404);
    throw new Error('Post not found');
  }

  if (post.user.userId.toString() !== req.user.id) {
    res.status(403);
    throw new Error('Not authorized to delete this post');
  }

  await Post.findByIdAndDelete(id);

  res.status(200).json({
    success: true,
    message: 'Post deleted successfully',
    data: {},
  });
});

// @desc Toggle like/unlike on a post
// @route POST /api/posts/:id/like
// @access Private
const toggleLike = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    res.status(400);
    throw new Error('Invalid post ID');
  }

  const post = await Post.findById(id);

  if (!post) {
    res.status(404);
    throw new Error('Post not found');
  }

  const alreadyLiked = post.likes.some(
    (like) => like.userId.toString() === req.user.id
  );

  if (alreadyLiked) {
    post.likes.pull({ userId: req.user.id });
  } else {
    post.likes.push({ userId: req.user.id, username: req.user.username });
  }

  await post.save();

  post.likedByCurrentUser = !alreadyLiked;

  res.status(200).json({
    success: true,
    message: alreadyLiked ? 'Post unliked' : 'Post liked',
    data: {
      liked: !alreadyLiked,
      likesCount: post.likes.length,
    },
  });
});

// @desc Comment on a post
// @route POST /api/posts/:id/comment
// @access Private
const commentOnPost = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    res.status(400);
    throw new Error('Invalid post ID');
  }

  const text = (req.body.text || '').trim();

  if (!text) {
    res.status(400);
    throw new Error('Comment text is required');
  }

  const post = await Post.findById(id);

  if (!post) {
    res.status(404);
    throw new Error('Post not found');
  }

  post.comments.push({
    userId: req.user.id,
    username: req.user.username,
    text,
  });

  await post.save();

  post.likedByCurrentUser = post.likes.some(
    (like) => like.userId.toString() === req.user.id
  );

  res.status(201).json({
    success: true,
    message: 'Comment added successfully',
    data: {
      post,
      comment: post.comments[post.comments.length - 1],
    },
  });
});

module.exports = {
  getPosts,
  getPostById,
  createPost,
  deletePost,
  toggleLike,
  commentOnPost,
};
