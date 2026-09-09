import { useCallback, useEffect, useState } from 'react';
import { Alert, Box, Button, CircularProgress, Container, Snackbar } from '@mui/material';
import api from '../services/api';
import CreatePost from '../components/CreatePost';
import PostCard from '../components/PostCard';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

const LIMIT = 10;

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });

  const showError = useCallback((message) => {
    setSnackbar({ open: true, message: message || 'Something went wrong.' });
  }, []);

  const fetchPosts = useCallback(async (pageNum, append = false) => {
    setError('');
    if (append) setLoadingMore(true);
    else setLoading(true);

    try {
      const { data } = await api.get('/posts', { params: { page: pageNum, limit: LIMIT } });
      const payload = data?.data || data || {};
      const nextPosts = Array.isArray(payload.posts) ? payload.posts : [];
      const nextPagination = payload.pagination || null;

      setPosts((prev) => (append ? [...prev, ...nextPosts] : nextPosts));
      setPage(nextPagination?.page || pageNum);
      setPagination(nextPagination);
    } catch (err) {
      setError('Unable to load posts. Please try again.');
      if (append) {
        setPosts((prev) => prev || []);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts(1);
  }, [fetchPosts]);

  const handleLoadMore = () => {
    if (pagination?.hasNextPage && !loadingMore) {
      fetchPosts(page + 1, true);
    }
  };

  const handlePostCreated = (newPost) => {
    if (!newPost) return;
    setPosts((prev) => [newPost, ...prev]);
  };

  const handleUpdatePost = (updatedPost) => {
    if (!updatedPost) return;
    setPosts((prev) => prev.map((p) => ((p?.id || p?._id) === (updatedPost?.id || updatedPost?._id) ? updatedPost : p)));
  };

  const handleDeletePost = (postId) => {
    if (!postId) return;
    setPosts((prev) => prev.filter((p) => (p?.id || p?._id) !== postId));
    setPagination((prev) => (prev ? { ...prev, totalPosts: Math.max((prev.totalPosts || 0) - 1, 0) } : prev));
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ open: false, message: '' });
  };

  return (
    <Container maxWidth="md" sx={{ pt: 3, pb: 6 }}>
      <CreatePost onPostCreated={handlePostCreated} onError={showError} />

      {loading && <LoadingSpinner label="Loading posts..." />}

      {!loading && error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {!loading && !error && posts.length === 0 && (
        <EmptyState message="Nothing here yet. Be the first to share something!" />
      )}

      {!loading && !error && posts.length > 0 && (
        <>
          {posts.map((post) => (
            <PostCard
              key={post?.id || post?._id || Math.random().toString(36).slice(2)}
              post={post}
              onUpdatePost={handleUpdatePost}
              onDeletePost={handleDeletePost}
              onError={showError}
            />
          ))}

          {pagination?.hasNextPage && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Button
                variant="outlined"
                onClick={handleLoadMore}
                disabled={loadingMore}
                startIcon={loadingMore ? <CircularProgress size={18} color="inherit" /> : null}
              >
                {loadingMore ? 'Loading...' : 'Load More'}
              </Button>
            </Box>
          )}
        </>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="error" variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Feed;
