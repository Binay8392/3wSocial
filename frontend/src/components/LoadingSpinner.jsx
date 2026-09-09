import { Box, CircularProgress, Typography } from '@mui/material';

const LoadingSpinner = ({ fullScreen = false, label = 'Loading...' }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        ...(fullScreen && {
          minHeight: '100vh',
          width: '100%',
        }),
        py: fullScreen ? 0 : 6,
      }}
    >
      <CircularProgress />
      {label && <Typography color="textSecondary">{label}</Typography>}
    </Box>
  );
};

export default LoadingSpinner;
