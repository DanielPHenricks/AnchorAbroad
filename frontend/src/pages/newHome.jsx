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
  TextField,
} from '@mui/material';
import apiService from '../services/api';

export default function NewHome() {
  const [favorites, setFavorites] = useState([]);
  const [messages, setMessages] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [profilePictureFile, setProfilePictureFile] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const data = await apiService.getFavorites();
        setFavorites(data.map((fav) => fav.program));
      } catch (err) {
        console.error('Error fetching favorites:', err);
        setFavorites([]);
      }
    };
    fetchFavorites();
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await apiService.getUserProfile();
        setUserProfile(data);
      } catch (err) {
        console.error('Error fetching profile:', err);
      }
    };
    fetchProfile();
  }, []);

  const handleProfileChange = (field, value) => {
    setUserProfile((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        [field]: value,
      },
    }));
  };

  const saveProfile = async () => {
    try {
      const formData = new FormData();
      const profile = userProfile.profile;

      for (const key in profile) {
        if (profile[key] !== null && profile[key] !== undefined) {
          formData.append(key, profile[key]);
        }
      }

      const response = await apiService.updateUserProfile(formData, true);

      setUserProfile((prev) => ({
        ...prev,
        profile: response, // update profile info
      }));

      setEditing(false);
    } catch (err) {
      console.error('Error saving profile:', err);
    }
  };

  return (
    <Box sx={{ p: 4, minHeight: '100vh', backgroundColor: '#f5f6fa' }}>
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
            boxShadow: 0,
          }}
          onClick={() => navigate('/map')}
        >
          Explore Programs
        </Button>
      </Box>

    </Box>
  );
}
