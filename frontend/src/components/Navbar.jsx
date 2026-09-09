import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Avatar,
  IconButton,
  Box,
  Container,
  Menu,
  MenuItem,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ForumIcon from '@mui/icons-material/Forum';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [mobileMenuAnchor, setMobileMenuAnchor] = useState(null);
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);

  const handleLogout = () => {
    logout();
    setUserMenuAnchor(null);
    setMobileMenuAnchor(null);
    navigate('/login');
  };

  const initial = user?.username?.charAt(0)?.toUpperCase() || 'U';

  return (
    <AppBar position="sticky" color="primary" elevation={1}>
      <Toolbar>
        <Container maxWidth="md" sx={{ display: 'flex', alignItems: 'center', px: { xs: 0, sm: 2 } }}>
          <Box
            component={Link}
            to="/feed"
            sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'inherit', textDecoration: 'none' }}
          >
            <ForumIcon />
            <Typography variant="h6" fontWeight={700} sx={{ display: { xs: 'none', sm: 'block' } }}>
              3W Social
            </Typography>
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          {isAuthenticated ? (
            <>
              {isMobile ? (
                <>
                  <IconButton
                    color="inherit"
                    aria-label="menu"
                    onClick={(e) => setMobileMenuAnchor(e.currentTarget)}
                  >
                    <MenuIcon />
                  </IconButton>
                  <Menu
                    anchorEl={mobileMenuAnchor}
                    open={Boolean(mobileMenuAnchor)}
                    onClose={() => setMobileMenuAnchor(null)}
                  >
                    <MenuItem onClick={() => { navigate('/feed'); setMobileMenuAnchor(null); }}>
                      Feed
                    </MenuItem>
                    <MenuItem onClick={handleLogout}>Logout</MenuItem>
                  </Menu>
                </>
              ) : (
                <>
                  <Button color="inherit" component={Link} to="/feed" sx={{ mr: 1 }}>
                    Feed
                  </Button>
                  <Button color="inherit" onClick={(e) => setUserMenuAnchor(e.currentTarget)}>
                    <Avatar sx={{ width: 28, height: 28, mr: 1, bgcolor: 'secondary.main', fontSize: 14 }}>
                      {initial}
                    </Avatar>
                    {user?.username}
                  </Button>
                  <Menu
                    anchorEl={userMenuAnchor}
                    open={Boolean(userMenuAnchor)}
                    onClose={() => setUserMenuAnchor(null)}
                  >
                    <MenuItem onClick={handleLogout}>Logout</MenuItem>
                  </Menu>
                </>
              )}
            </>
          ) : (
            <>
              <Button color="inherit" component={Link} to="/login" sx={{ mr: 1 }}>
                Login
              </Button>
              <Button variant="outlined" color="inherit" component={Link} to="/signup">
                Sign Up
              </Button>
            </>
          )}
        </Container>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
