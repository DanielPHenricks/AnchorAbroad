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
import { School } from '@mui/icons-material';
import apiService from '../services/api';
import { useAlumni } from '../contexts/AlumniContext';

export default function Home() {
  const { isAuthenticated: isAlumni } = useAlumni();
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
    setMessages([
      { id: 1, name: 'Sophia Carter', program: 'Art History' },
      { id: 2, name: 'Ethan Walker', program: 'Spanish Language' },
      { id: 3, name: 'Olivia Bennett', program: 'Japanese Culture' },
      { id: 4, name: 'Liam Harper', program: 'French Literature' },
    ]);
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

      <Grid container spacing={4} justifyContent="center" alignItems="flex-start">
        {/* Favorite Programs - Only show for students */}
        {!isAlumni && (
          <Grid item xs={12} md={4}>
            <Paper
              elevation={3}
              sx={{
                p: 3,
                borderRadius: 3,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Typography variant="h6" fontWeight="600" mb={2}>
                My Favorite Programs
              </Typography>
              <List sx={{ flexGrow: 1, overflowY: 'auto' }}>
                {favorites.length > 0 ? (
                  favorites.map((p) => (
                    <ListItemButton
                      key={p.program_id}
                      onClick={() => navigate(`/programs/${p.program_id}`)}
                      sx={{
                        border: '1px solid #eee',
                        borderRadius: 2,
                        mb: 1,
                      }}
                    >
                      <ListItemText
                        primary={p.program_details.name}
                        secondary={p.location || p.subtitle}
                      />
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
        )}

        {/* Messages */}
        <Grid item xs={12} md={4}>
          <Paper
            elevation={3}
            sx={{
              p: 3,
              borderRadius: 3,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Typography variant="h6" fontWeight="600" mb={2}>
              Messages
            </Typography>
            <List sx={{ flexGrow: 1, overflowY: 'auto' }}>
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

        {/* My Profile */}
        <Grid item xs={12} md={4}>
          <Paper
            elevation={3}
            sx={{
              p: 3,
              borderRadius: 3,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
            }}
          >
            <Typography variant="h6" fontWeight="600" mb={2}>
              My Profile
            </Typography>
            {userProfile ? (
              <>
                {/* Check if this is an alumni or student profile */}
                {userProfile.alumni ? (
                  /* Alumni Profile */
                  <>
                    <Avatar
                      src={
                        userProfile.alumni.profile_picture
                          ? `${apiService.baseURL.replace('/api', '')}${userProfile.alumni.profile_picture}`
                          : ''
                      }
                      sx={{ width: 96, height: 96, mb: 1 }}
                    />
                    <Typography>
                      <strong>Name:</strong> {userProfile.alumni.first_name} {userProfile.alumni.last_name}
                    </Typography>
                    <Typography>
                      <strong>Email:</strong> {userProfile.alumni.email}
                    </Typography>
                    <Typography>
                      <strong>Graduation Year:</strong> {userProfile.alumni.graduation_year}
                    </Typography>
                    <Typography>
                      <strong>Study Abroad Term:</strong> {userProfile.alumni.study_abroad_term || 'N/A'}
                    </Typography>

                    {/* My Program Badge */}
                    {userProfile.alumni.program && (
                      <Box
                        sx={{
                          mt: 2,
                          p: 2,
                          borderRadius: 2,
                          backgroundColor: '#B49248',
                          color: 'white',
                          textAlign: 'center',
                        }}
                      >
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 1,
                            mb: 1,
                          }}
                        >
                          <School />
                          <Typography variant="subtitle1" fontWeight="600">
                            My Program
                          </Typography>
                        </Box>
                        <Typography variant="body2">
                          {userProfile.alumni.program.program_details?.name || userProfile.alumni.program.name}
                        </Typography>
                      </Box>
                    )}

                    {userProfile.alumni.bio && (
                      <Typography sx={{ mt: 2 }}>
                        <strong>Bio:</strong> {userProfile.alumni.bio}
                      </Typography>
                    )}
                  </>
                ) : (
                  /* Student Profile */
                  <>
                    <Avatar
                      src={
                        userProfile.profile?.profile_picture
                          ? `${apiService.baseURL.replace('/api', '')}${userProfile.profile.profile_picture}`
                          : ''
                      }
                      sx={{ width: 96, height: 96, mb: 1 }}
                    />
                    {editing && (
                      <Button variant="outlined" component="label" size="small">
                        Upload New Picture
                        <input
                          type="file"
                          hidden
                          accept="image/*"
                          onChange={(e) => handleProfileChange('profile_picture', e.target.files[0])}
                        />
                      </Button>
                    )}
                    <Typography>
                      <strong>Name:</strong> {userProfile.user?.first_name} {userProfile.user?.last_name}
                    </Typography>
                    <Typography>
                      <strong>Username:</strong> {userProfile.user?.username}
                    </Typography>
                    <Typography>
                      <strong>Email:</strong> {userProfile.user?.email}
                    </Typography>

                    <TextField
                      label="Graduation Year"
                      value={userProfile.profile?.year || ''}
                      onChange={(e) => handleProfileChange('year', e.target.value)}
                      fullWidth
                      sx={{ mt: 1 }}
                      disabled={!editing}
                    />
                    <TextField
                      label="Major"
                      value={userProfile.profile?.major || ''}
                      onChange={(e) => handleProfileChange('major', e.target.value)}
                      fullWidth
                      sx={{ mt: 1 }}
                      disabled={!editing}
                    />
                    <TextField
                      label="Study Abroad Term"
                      value={userProfile.profile?.study_abroad_term || ''}
                      onChange={(e) => handleProfileChange('study_abroad_term', e.target.value)}
                      fullWidth
                      sx={{ mt: 1 }}
                      disabled={!editing}
                    />

                    {editing ? (
                      <Button onClick={saveProfile} sx={{ mt: 2 }}>
                        Save
                      </Button>
                    ) : (
                      <Button onClick={() => setEditing(true)} sx={{ mt: 2 }}>
                        Edit
                      </Button>
                    )}
                  </>
                )}
              </>
            ) : (
              <Typography>Loading profile...</Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
