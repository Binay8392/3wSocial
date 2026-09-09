import { useEffect, useState } from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  CardMedia,
  CardActions,
  Avatar,
  IconButton,
  Typography,
  Box,
  Button,
  Divider,
  Dialog,
  DialogTitle,
  DialogActions,
  Tooltip,
} from '@mui/material';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import ThumbUpAltOutlinedIcon from '@mui/icons-material/ThumbUpAltOutlined';
import CommentIcon from '@mui/icons-material/Comment';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { timeAgo } from '../utils/formatDate';
import CommentSection from './CommentSection';

const PostCard = ({ post, onUpdatePost, onDeletePost, onError }) => {
  const { user } = useAuth();

  const normalizedPost = {
    id: post?.id || post?._id || '',
    text: post?.text || '',
    image: post?.image || '',
    likesCount: Number(post?.likesCount ?? post?.likes?.length ?? 0),
    commentsCount: Number(post?.commentsCount ?? post?.comments?.length ?? 0),
    likedByCurrentUser: Boolean(post?.likedByCurrentUser ?? post?._likedByCurrentUser ?? false),
    user: post?.user || { userId: '', username: 'Unknown User' },
    comments: Array.isArray(post?.comments) ? post.comments : [],
    createdAt: post?.createdAt || new Date().toISOString(),
  };

  const [localPost, setLocalPost] = useState(normalizedPost);
  const [showComments, setShowComments] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    setLocalPost(normalizedPost);
  }, [post]);

  const isOwner = Boolean(user) && (user?._id === localPost.user?.userId || user?.id === localPost.user?.userId);

  const handleToggleLike = async () => {
    if (likeLoading || !localPost.id) return;

    const optimisticLiked = !localPost.likedByCurrentUser;
    const optimisticCount = (typeof localPost.likesCount === 'number' ? localPost.likesCount : 0) + (optimisticLiked ? 1 : -1);

    setLocalPost({
      ...localPost,
      likedByCurrentUser: optimisticLiked,
      likesCount: optimisticCount,
    });
    setLikeLoading(true);

    try {
      const { data } = await api.post(`/posts/${localPost.id}/like`);
      const payload = data?.data || data || {};
      const updated = {
        ...localPost,
        likedByCurrentUser: Boolean(payload.liked ?? optimisticLiked),
        likesCount: Number(payload.likesCount ?? optimisticCount),
      };
      setLocalPost(updated);
      if (onUpdatePost) onUpdatePost(updated);
    } catch (err) {
      setLocalPost(normalizedPost);
      if (onError) onError(err?.message || 'Unable to update like.');
    } finally {
      setLikeLoading(false);
    }
  };

  const handleCommentAdded = (payload) => {
    const nextPost = payload?.post || payload || normalizedPost;
    const updated = {
      ...localPost,
      ...nextPost,
      comments: Array.isArray(nextPost.comments) ? nextPost.comments : localPost.comments,
      likedByCurrentUser:
        nextPost.likedByCurrentUser ?? nextPost._likedByCurrentUser ?? localPost.likedByCurrentUser,
    };
    setLocalPost(updated);
    if (onUpdatePost) onUpdatePost(updated);
  };

  const handleDelete = async () => {
    if (deleteLoading || !localPost.id) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/posts/${localPost.id}`);
      if (onDeletePost) onDeletePost(localPost.id);
    } catch (err) {
      if (onError) onError(err?.message || 'Unable to delete post.');
    } finally {
      setDeleteLoading(false);
      setDeleteOpen(false);
    }
  };

  const initial = localPost.user?.username?.charAt(0)?.toUpperCase() || 'U';

  return (
    <Card sx={{ mb: 3 }}>
      <CardHeader
        avatar={
          <Avatar aria-label={localPost.user?.username || 'User'} sx={{ bgcolor: 'secondary.main' }}>
            {initial}
          </Avatar>
        }
        title={
          <Typography variant="subtitle1" fontWeight={700}>
            {localPost.user?.username || 'Unknown User'}
          </Typography>
        }
        subheader={timeAgo(localPost.createdAt)}
        action={
          isOwner && (
            <Tooltip title="Delete post">
              <IconButton aria-label="delete post" onClick={() => setDeleteOpen(true)}>
                <DeleteOutlineIcon />
              </IconButton>
            </Tooltip>
          )
        }
      />

      {(localPost.text || localPost.image) && (
        <CardContent sx={{ pt: 0, pb: localPost.image ? 1 : 2 }}>
          {localPost.text && (
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              {localPost.text}
            </Typography>
          )}
        </CardContent>
      )}

      {localPost.image && (
        <CardMedia
          component="img"
          image={localPost.image}
          alt="Post attachment"
          sx={{ maxHeight: 480, objectFit: 'contain', bgcolor: '#f5f6fa' }}
        />
      )}

      <CardActions disableSpacing sx={{ px: 2, py: 1 }}>
        <Button
          size="small"
          color={localPost.likedByCurrentUser ? 'secondary' : 'primary'}
          onClick={handleToggleLike}
          disabled={likeLoading}
          aria-label={localPost.likedByCurrentUser ? 'Unlike post' : 'Like post'}
          startIcon={
            localPost.likedByCurrentUser ? <ThumbUpAltIcon /> : <ThumbUpAltOutlinedIcon />
          }
        >
          {localPost.likesCount}
        </Button>
        <Button
          size="small"
          color="primary"
          onClick={() => setShowComments((prev) => !prev)}
          aria-label="Toggle comments"
          startIcon={<CommentIcon />}
        >
          {localPost.commentsCount}
        </Button>
      </CardActions>

      {showComments && (
        <Box sx={{ px: 2, pb: 2 }}>
          <Divider sx={{ mb: 1 }} />
          <CommentSection
            postId={localPost.id}
            comments={localPost.comments}
            onCommentAdded={handleCommentAdded}
            onError={onError}
          />
        </Box>
      )}

      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <DialogTitle>Delete this post?</DialogTitle>
        <DialogActions>
          <Button onClick={() => setDeleteOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" disabled={deleteLoading}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default PostCard;
