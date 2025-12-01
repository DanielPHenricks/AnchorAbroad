import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Grid,
  Paper,
  Typography,
  List,
  ListItemButton,
  ListItemText,

  Box,
  Button,
  TextField,
  Rating,
} from '@mui/material';
import { School, Delete } from '@mui/icons-material';
import apiService from '../services/api';
import { useAlumni } from '../contexts/AlumniContext';

export default function Home() {
  const { isAuthenticated: isAlumni } = useAlumni();
  const [favorites, setFavorites] = useState([]);
  const [reviews, setReviews] = useState([]);

  const [userProfile, setUserProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (isAlumni) {
          const data = await apiService.getAlumniReviews();
          setReviews(data);
        } else {
          const data = await apiService.getFavorites();
          setFavorites(data.map((fav) => fav.program));
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };
    fetchData();
  }, [isAlumni]);



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

  const handleDeleteReview = async (reviewId, e) => {
    e.stopPropagation(); // Prevent navigation
    if (window.confirm('Are you sure you want to delete this review?')) {
      try {
        await apiService.deleteReview(reviewId);
        setReviews((prev) => prev.filter((r) => r.id !== reviewId));
      } catch (err) {
        console.error('Error deleting review:', err);
      }
    }
  };

  const saveProfile = async () => {
    try {
      const response = await apiService.updateUserProfile(userProfile.profile);

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
              {isAlumni ? 'My Reviews' : 'My Favorite Programs'}
            </Typography>
            <List sx={{ flexGrow: 1, overflowY: 'auto' }}>
              {isAlumni ? (
                reviews.length > 0 ? (
                  reviews.map((r) => (
                    <ListItemButton
                      key={r.id}
                      onClick={() => navigate(`/programs/${r.program}`)}
                      sx={{
                        border: '1px solid #eee',
                        borderRadius: 2,
                        mb: 2,
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', mb: 1, gap: 2 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                          <Typography variant="subtitle1" fontWeight="600">
                            {r.program_name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
                            {new Date(r.date).toLocaleDateString()}
                          </Typography>
                        </Box>
                        <Delete
                          color="error"
                          fontSize="small"
                          onClick={(e) => handleDeleteReview(r.id, e)}
                          sx={{
                            cursor: 'pointer',
                            '&:hover': { opacity: 0.7 }
                          }}
                        />
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Rating value={r.rating} readOnly size="small" />
                      </Box>
                      <Typography variant="body2" color="text.secondary" noWrap sx={{ width: '100%' }}>
                        {r.text}
                      </Typography>
                    </ListItemButton>
                  ))
                ) : (
                  <Typography variant="body2" color="textSecondary" sx={{ p: 2 }}>
                    No reviews yet. Go to your program page to leave a review!
                  </Typography>
                )
              ) : favorites.length > 0 ? (
                favorites.map((p) => {
                  const avgRating =
                    p.reviews && p.reviews.length > 0
                      ? p.reviews.reduce((acc, r) => acc + r.rating, 0) / p.reviews.length
                      : 0;

                  // Get description preview
                  let descriptionPreview = '';
                  if (p.sections && p.sections.length > 0) {
                    // Try to find a section with content
                    const section = p.sections.find(s => s.content && s.content.length > 0);
                    if (section) {
                      const content = Array.isArray(section.content) ? section.content.join(' ') : section.content;
                      // Strip HTML tags
                      const text = content.replace(/<[^>]*>/g, '');
                      descriptionPreview = text.length > 100 ? text.substring(0, 100) + '...' : text;
                    }
                  }

                  return (
                    <ListItemButton
                      key={p.program_id}
                      onClick={() => navigate(`/programs/${p.program_id}`)}
                      sx={{
                        border: '1px solid #eee',
                        borderRadius: 2,
                        mb: 2,
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                      }}
                    >
                      <ListItemText
                        primary={p.program_details.name}
                        secondary={p.location || p.subtitle}
                        sx={{ width: '100%', mb: 0.5 }}
                      />
                      {descriptionPreview && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1, width: '100%' }}>
                          {descriptionPreview}
                        </Typography>
                      )}
                      {p.reviews && p.reviews.length > 0 && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Rating value={avgRating} readOnly size="small" precision={0.5} />
                          <Typography variant="caption" color="text.secondary">
                            ({p.reviews.length} reviews)
                          </Typography>
                        </Box>
                      )}
                    </ListItemButton>
                  );
                })
              ) : (
                <Typography variant="body2" color="textSecondary" sx={{ p: 2 }}>
                  No favorite programs yet. Explore programs and add some to your favorites!
                </Typography>
              )}
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
            <Typography variant="h6" fontWeight="600" mb={3}>
              My Profile
            </Typography>
            {userProfile ? (
              <>
                {/* Check if this is an alumni or student profile */}
                {userProfile.alumni ? (
                  /* Alumni Profile */
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
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
                        onClick={() => navigate(`/programs/${userProfile.alumni.program.program_id}`)}
                        sx={{
                          mt: 1,
                          p: 2,
                          borderRadius: 2,
                          backgroundColor: '#B49248',
                          color: 'white',
                          textAlign: 'center',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease-in-out',
                          '&:hover': {
                            backgroundColor: '#9a7b3a',
                            transform: 'translateY(-2px)',
                            boxShadow: 2
                          }
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
                      <Typography sx={{ mt: 1 }}>
                        <strong>Bio:</strong> {userProfile.alumni.bio}
                      </Typography>
                    )}
                  </Box>
                ) : (
                  /* Student Profile */
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
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
                      variant={editing ? 'outlined' : 'filled'}
                      label="Graduation Year"
                      value={userProfile.profile?.year || ''}
                      onChange={(e) => handleProfileChange('year', e.target.value)}
                      fullWidth
                      disabled={!editing}
                      slotProps={{
                        input: {
                          sx: {
                            color: 'black',
                            '&.Mui-disabled': {
                              color: 'black !important',
                              '-webkit-text-fill-color': 'black !important',
                            },
                            '& input': {
                              color: 'black !important',
                              '-webkit-text-fill-color': 'black !important',
                            },
                            '& .MuiInputLabel-root': { color: 'black !important' }
                          }
                        },
                        inputLabel: {
                          sx: { color: 'black !important' }
                        }
                      }}
                    />
                    <TextField
                      variant={editing ? 'outlined' : 'filled'}
                      label="Major"
                      value={userProfile.profile?.major || ''}
                      onChange={(e) => handleProfileChange('major', e.target.value)}
                      fullWidth
                      disabled={!editing}
                      slotProps={{
                        input: {
                          sx: {
                            color: 'black',
                            '&.Mui-disabled': {
                              color: 'black !important',
                              '-webkit-text-fill-color': 'black !important',
                            },
                            '& input': {
                              color: 'black !important',
                              '-webkit-text-fill-color': 'black !important',
                            },
                            '& .MuiInputLabel-root': { color: 'black !important' }
                          }
                        },
                        inputLabel: {
                          sx: { color: 'black !important' }
                        }
                      }}
                    />
                    <TextField
                      variant={editing ? 'outlined' : 'filled'}
                      label="Study Abroad Term"
                      value={userProfile.profile?.study_abroad_term || ''}
                      onChange={(e) => handleProfileChange('study_abroad_term', e.target.value)}
                      fullWidth
                      disabled={!editing}
                      slotProps={{
                        input: {
                          sx: {
                            color: 'black',
                            '&.Mui-disabled': {
                              color: 'black !important',
                              '-webkit-text-fill-color': 'black !important',
                            },
                            '& input': {
                              color: 'black !important',
                              '-webkit-text-fill-color': 'black !important',
                            },
                            '& .MuiInputLabel-root': { color: 'black !important' }
                          }
                        },
                        inputLabel: {
                          sx: { color: 'black !important' }
                        }
                      }}
                    />

                    {editing ? (
                      <Button onClick={saveProfile} sx={{ mt: 1 }}>
                        Save
                      </Button>
                    ) : (
                      <Button onClick={() => setEditing(true)} sx={{ mt: 1 }}>
                        Edit
                      </Button>
                    )}
                  </Box>
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
