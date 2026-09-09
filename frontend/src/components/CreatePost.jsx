import { useState, useRef } from 'react';
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Box,
  IconButton,
  CircularProgress,
  Alert,
} from '@mui/material';
import ImageIcon from '@mui/icons-material/Image';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import api from '../services/api';

const CreatePost = ({ onPostCreated, onError }) => {
  const [text, setText] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {
      setImageFile(null);
      setImagePreview('');
      setError('Only JPG, PNG, and WEBP images are allowed.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    if (file.size > maxSize) {
      setImageFile(null);
      setImagePreview('');
      setError('Image size must be 5MB or less.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setError('');
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedText = text.trim();

    if (!trimmedText && !imageFile) {
      setError('Please add some text or an image to share.');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      if (trimmedText) formData.append('text', trimmedText);
      if (imageFile) formData.append('image', imageFile);

      const { data } = await api.post('/posts', formData);
      onPostCreated(data.data.post);
      setText('');
      handleRemoveImage();
      setSuccess('Post published successfully!');
    } catch (err) {
      setError(err.message);
      if (onError) onError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Create a Post
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            multiline
            minRows={3}
            maxRows={8}
            placeholder="What's on your mind?"
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={submitting}
            inputProps={{ 'aria-label': 'What is on your mind' }}
          />

          {imagePreview ? (
            <Box sx={{ position: 'relative', mt: 2, mb: 2 }}>
              <img
                src={imagePreview}
                alt="Selected attachment preview"
                style={{ maxHeight: 300, maxWidth: '100%', borderRadius: 8, display: 'block' }}
              />
              <IconButton
                aria-label="Remove selected image"
                onClick={handleRemoveImage}
                disabled={submitting}
                sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'rgba(0,0,0,0.55)', color: '#fff', '&:hover': { bgcolor: 'rgba(0,0,0,0.75)' } }}
              >
                <CloseIcon />
              </IconButton>
            </Box>
          ) : (
            <Box sx={{ mt: 2, mb: 2 }}>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleFileChange}
                style={{ display: 'none' }}
                id="post-image-input"
              />
              <label htmlFor="post-image-input">
                <Button
                  component="span"
                  variant="outlined"
                  startIcon={<ImageIcon />}
                  disabled={submitting}
                >
                  Add Image
                </Button>
              </label>
            </Box>
          )}

          <Button
            type="submit"
            variant="contained"
            endIcon={submitting ? <CircularProgress size={18} color="inherit" /> : <SendIcon />}
            disabled={submitting}
            fullWidth
          >
            {submitting ? 'Posting...' : 'Post'}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default CreatePost;
