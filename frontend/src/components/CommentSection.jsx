import { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Avatar,
  Divider,
} from '@mui/material';
import CommentIcon from '@mui/icons-material/Comment';
import SendIcon from '@mui/icons-material/Send';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { timeAgo } from '../utils/formatDate';

const CommentSection = ({ postId, comments, onCommentAdded, onError }) => {
  const { isAuthenticated } = useAuth();
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const safeComments = Array.isArray(comments) ? comments : [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || submitting) return;

    setSubmitting(true);
    try {
      const { data } = await api.post(`/posts/${postId}/comment`, { text: trimmed });
      const payload = data?.data || data || {};
      if (onCommentAdded) onCommentAdded(payload);
      setText('');
    } catch (err) {
      if (onError) onError(err?.message || 'Unable to add comment.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ mt: 1 }}>
      <Divider sx={{ mb: 2 }} />
      <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <CommentIcon fontSize="small" color="primary" />
        {safeComments.length} {safeComments.length === 1 ? 'comment' : 'comments'}
      </Typography>

      {safeComments.length === 0 ? (
        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
          No comments yet. Be the first to comment!
        </Typography>
      ) : (
        <Box sx={{ mb: 2 }}>
          {safeComments.map((comment) => (
            <Box key={comment?._id || `${comment?.userId || 'user'}-${comment?.createdAt || Date.now()}`} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 1.5 }}>
              <Avatar sx={{ width: 30, height: 30, bgcolor: 'primary.main', fontSize: 13 }}>
                {comment?.username?.charAt(0)?.toUpperCase() || 'U'}
              </Avatar>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                  <Typography variant="body2" fontWeight={600}>{comment?.username || 'User'}</Typography>
                  <Typography variant="caption" color="textSecondary">{timeAgo(comment?.createdAt)}</Typography>
                </Box>
                <Typography variant="body2">{comment?.text || ''}</Typography>
              </Box>
            </Box>
          ))}
        </Box>
      )}

      {isAuthenticated ? (
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', gap: 1 }}>
          <TextField
            size="small"
            fullWidth
            placeholder="Write a comment..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={submitting}
            inputProps={{ 'aria-label': 'Write a comment' }}
          />
          <Button
            type="submit"
            variant="contained"
            size="small"
            disabled={!text.trim() || submitting}
            startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : <SendIcon />}
          >
            Post
          </Button>
        </Box>
      ) : (
        <Typography variant="body2" color="textSecondary">
          Log in to comment.
        </Typography>
      )}
    </Box>
  );
};

export default CommentSection;
