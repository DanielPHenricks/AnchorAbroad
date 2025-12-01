/**
 * Names: Daniel, Jacob, Maharshi, Ben
 * Time: 2 hours
 */

import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link } from 'react-router';

const Navbar = ({ user, onLogout }) => {
  return (
    <AppBar position="fixed" sx={{ boxShadow: 0 }}>
      <Toolbar sx={{ minHeight: 64, paddingLeft: 2, paddingRight: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Link
            to="/"
            style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}
          >
            <img
              src="/logos/anchor.png"
              alt="Anchor Abroad Logo"
              style={{ height: '40px', width: 'auto' }}
            />
          </Link>

          <Typography variant="h6" component="div" sx={{ fontWeight: 500 }}>
            <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
              Anchor Abroad
            </Link>
          </Typography>
        </Box>

        {/* Right side buttons */}
        <Box sx={{ marginLeft: 'auto', display: 'flex', gap: 2 }}>
          {user && (
            <>
              <Button color="inherit" component={Link} to="/profile" sx={{ textTransform: 'none' }}>
                Profile
              </Button>
              <Button color="inherit" component={Link} to="/map" sx={{ textTransform: 'none' }}>
                Programs
              </Button>
              <Button color="inherit" component={Link} to="/chat" sx={{ textTransform: 'none' }}>
                Chat
              </Button>
            </>
          )}
          <Button
            color="inherit"
            onClick={user ? onLogout : undefined}
            component={user ? undefined : Link}
            to={user ? undefined : '/login'}
            sx={{ textTransform: 'none' }}
          >
            {user && 'Logout'}
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
