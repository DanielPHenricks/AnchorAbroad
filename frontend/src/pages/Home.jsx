/**
 * Names: Daniel, Jacob, Maharshi, Ben
 * Time: 2 hours
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Grid,
  Paper,
  Typography,
  List,
  ListItemButton,
  ListItemText,
  Avatar,
  Box,
  Button,
} from '@mui/material';
import apiService from '../services/api';

export default function Home() {
  const [favorites, setFavorites] = useState([]);
  const [messages, setMessages] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const data = await apiService.getFavorites();
        setFavorites(data.map(fav => fav.program));
      } catch (err) {
        console.error('Error fetching favorites:', err);
        // If user is not authenticated, just set empty favorites
        setFavorites([]);
      }
    };

    fetchFavorites();
  }, []);

  useEffect(() => {
    setMessages([
      { id: 1, name: 'Sophia Carter', program: 'Art History' },
      { id: 2, name: 'Ethan Walker', program: 'Spanish Language' },
      { id: 3, name: 'Olivia Bennett', program: 'Japanese Culture' },
      { id: 4, name: 'Liam Harper', program: 'French Literature' },
    ]);
  }, []);

  return (
    <Box sx={{ p: 4, minHeight: '100vh' }}>
      {/* Explore Programs button */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
        <Button
          variant="contained"
          color="secondary"
          size="large"
          sx={{
            borderRadius: 12,
            textTransform: 'none',
            px: 4,
            py: 1.5,
            fontWeight: 600,
            boxShadow: 0
          }}
          onClick={() => navigate('/map')}
        >
          Explore Programs
        </Button>
      </Box>

      <Grid container spacing={4} justifyContent="center">
        {/* Favorite Programs */}
        <Grid item xs={12} md={5}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 3}}>
            <Typography variant="h6" fontWeight="600" mb={2}>
              My Favorite Programs
            </Typography>
            <List>
              {favorites.length > 0 ? (
                favorites.map((p) => (
                  <ListItemButton
                    key={p.program_id}
                    onClick={() => navigate(`/programs/${p.program_id}`)}
                    sx={{
                      border: '1px solid #eee',
                      borderRadius: 2,
                      backgroundColor: 'secondary.main',
                      mb: 1,
                      transition: 'all 0.2s',
                      '&:hover': {
                        backgroundColor: 'secondary.dark',
                      }
                    }}
                  >
                    <ListItemText primary={p.program_details.name} secondary={p.location || p.subtitle} />
                  </ListItemButton>
                ))
              ) : (
                <Typography variant="body2" color="textSecondary" sx={{ p: 2 }}>
                  No favorite programs yet. Explore programs and add some to your favorites!
                </Typography>
              )}
            </List>
          </Paper>
        </Grid>

        {/* Messages */}
        <Grid item xs={12} md={5}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" fontWeight="600" mb={2}>
              Messages
            </Typography>
            <List>
              {messages.map((m) => (
                <ListItemButton
                  key={m.id}
                  onClick={() => navigate(`/messages/${m.id}`)}
                  sx={{
                    border: '1px solid #eee',
                    borderRadius: 2,
                    mb: 1,
                  }}
                >
                  <Avatar sx={{ mr: 2 }}>{m.name[0]}</Avatar>
                  <ListItemText primary={m.name} secondary={`Alumni, ${m.program}`} />
                </ListItemButton>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
