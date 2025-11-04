/**
 * Names: Daniel, Jacob, Maharshi, Ben
 * Time: 2 hours
 */

import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link } from 'react-router-dom';

const Navbar = ({ user, onLogout }) => {
  return (
    <AppBar position="static" sx={{ boxShadow: 0 }}>
      <Toolbar sx={{ minHeight: 64, paddingLeft: 2, paddingRight: 2, position: 'relative' }}>
        <Typography
          variant="h6"
          component="div"
          sx={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            textAlign: 'center',
          }}
        >
          <Link to="/home" style={{ textDecoration: 'none', color: 'inherit' }}>
            Anchor Abroad
          </Link>
        </Typography>

        {/* Right side buttons */}
        <Box sx={{ marginLeft: 'auto', display: 'flex', gap: 2 }}>
          {user && (
            <>
              <Button color="inherit" component={Link} to="/home" sx={{ textTransform: 'none' }}>
                Home/Favorites
              </Button>
              <Button
                color="inherit"
                component={Link}
                to="/messages/1"
                sx={{ textTransform: 'none' }}
              >
                Messages
              </Button>
              <Button color="inherit" component={Link} to="/map" sx={{ textTransform: 'none' }}>
                Map
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
