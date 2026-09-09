import React from 'react';
import { Alert, Button, Box, Typography } from '@mui/material';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch() {
    // Intentionally silent in the UI; avoid exposing stack traces to users.
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 3,
          }}
        >
          <Alert severity="error" sx={{ maxWidth: 520, width: '100%' }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Something went wrong.
            </Typography>
            <Button variant="contained" onClick={this.handleReload}>
              Reload the page
            </Button>
          </Alert>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
