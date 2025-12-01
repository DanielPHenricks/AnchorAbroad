/**
 * Names: Daniel, Jacob, Maharshi, Ben
 * Time: 30 mins
 */

import { useParams, useLocation } from 'react-router';
import { useState, useEffect, useRef } from 'react';
import { Favorite, FavoriteBorder, ChevronLeft, ChevronRight, School, RateReview } from '@mui/icons-material';
import {
  Typography,
  Box,
  Button,
  Paper,
  List,
  ListItemButton,
  ListItemText,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Rating,
  Avatar,
} from '@mui/material';
import apiService from '../services/api';
import { useAlumni } from '../contexts/AlumniContext';

export default function ProgramDetail() {
  const { id } = useParams();
  const location = useLocation();
  const { isAuthenticated: isAlumni, alumni } = useAlumni();
  const [program, setProgram] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState(0);
  const [menuOpen, setMenuOpen] = useState(true);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [submittingReview, setSubmittingReview] = useState(false);
  const sectionRefs = useRef([]);
  const reviewsRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [programs, favoriteCheck] = await Promise.all([
          apiService.getPrograms(),
          apiService.checkFavorite(id).catch(() => ({ is_favorite: false })),
        ]);
        const foundProgram = programs.find((p) => p.program_id === id);
        setProgram(foundProgram);
        setIsFavorite(favoriteCheck.is_favorite);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching program:', err);
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // Handle hash scrolling
  useEffect(() => {
    if (program && location.hash === '#reviews') {
      // Small timeout to ensure rendering is complete
      setTimeout(() => {
        reviewsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // Calculate index for reviews section
        const sectionsCount = program.sections?.filter((section) => section.content && section.content.length > 0).length || 0;
        setActiveSection(sectionsCount);
      }, 100);
    }
  }, [program, location.hash]);

  const toggleFavorite = async () => {
    try {
      if (isFavorite) {
        await apiService.removeFavorite(id);
        setIsFavorite(false);
      } else {
        await apiService.addFavorite(id);
        setIsFavorite(true);
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
    }
  };

  const handleOpenReviewDialog = () => {
    setReviewDialogOpen(true);
  };

  const handleCloseReviewDialog = () => {
    setReviewDialogOpen(false);
    setReviewText('');
    setReviewRating(5);
  };

  const handleSubmitReview = async () => {
    if (!reviewText.trim()) return;

    setSubmittingReview(true);
    try {
      const newReview = await apiService.addReview(id, {
        text: reviewText,
        rating: reviewRating,
      });

      // Update program with new review
      setProgram(prev => ({
        ...prev,
        reviews: [newReview, ...(prev.reviews || [])]
      }));

      handleCloseReviewDialog();
    } catch (err) {
      console.error('Error submitting review:', err);
      alert('Failed to submit review. Please try again.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const scrollToSection = (index) => {
    setActiveSection(index);
    sectionRefs.current[index]?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  if (loading) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  if (!program) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography variant="h5">Program not found</Typography>
      </Box>
    );
  }

  const availableSections =
    program.sections?.filter((section) => section.content && section.content.length > 0) || [];

  // Check if this is the alumni's program
  const isMyProgram = isAlumni && alumni?.program?.program_id === id;

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: '#FFFFFF',
        position: 'relative',
      }}
    >
      <Box
        sx={{
          width: menuOpen ? 280 : 60,
          backgroundColor: 'secondary.main',
          position: 'fixed',
          left: 0,
          top: '64px',
          bottom: 0,
          height: 'auto',
          overflow: 'hidden',
          overscrollBehavior: 'none',
          display: 'flex',
          flexDirection: 'column',
          transition: 'width 0.3s ease',
          zIndex: (theme) => theme.zIndex.drawer,
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
          <IconButton
            onClick={() => setMenuOpen(!menuOpen)}
            sx={{
              color: 'secondary.contrastText',
              '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' },
            }}
            aria-label={menuOpen ? 'Collapse menu' : 'Expand menu'}
          >
            {menuOpen ? <ChevronLeft /> : <ChevronRight />}
          </IconButton>
        </Box>

        {menuOpen && (
          <>
            {isMyProgram && (
              <Box sx={{ px: 2, pb: 1 }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 1,
                    py: 1.5,
                    px: 2,
                    borderRadius: 12,
                    backgroundColor: '#B49248',
                    color: 'white',
                    fontWeight: 600,
                  }}
                >
                  <School />
                  <Typography variant="body1" fontWeight="600">
                    My Program
                  </Typography>
                </Box>
              </Box>
            )}

            {!isAlumni && (
              <Box sx={{ px: 2, pb: 1 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={isFavorite ? <Favorite sx={{ color: '#B49248' }} /> : <FavoriteBorder />}
                  onClick={toggleFavorite}
                  sx={{
                    borderRadius: 12,
                    textTransform: 'none',
                    color: 'primary.main',
                    borderColor: 'primary.main',
                  }}
                >
                  {isFavorite ? 'Favorited' : 'Add to Favorites'}
                </Button>
              </Box>
            )}

            {isAlumni && isMyProgram && (
              <Box sx={{ px: 2, pb: 1 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<RateReview />}
                  onClick={handleOpenReviewDialog}
                  sx={{
                    borderRadius: 12,
                    textTransform: 'none',
                    color: 'primary.main',
                    borderColor: 'primary.main',
                  }}
                >
                  Write a Review
                </Button>
              </Box>
            )}

            <Divider sx={{ borderColor: 'rgba(255,255,255,0.2)' }} />

            <Box sx={{ overflow: 'hidden' }}>
              <Box sx={{ px: 2, py: 1 }}>
                <List sx={{ overflow: 'visible' }}>
                  {availableSections.map((section, index) => (
                    <ListItemButton
                      key={index}
                      selected={activeSection === index}
                      onClick={() => scrollToSection(index)}
                      sx={{
                        borderRadius: 1,
                        backgroundColor: activeSection === index ? 'primary.main' : 'transparent',
                        color:
                          activeSection === index
                            ? 'primary.contrastText'
                            : 'secondary.contrastText',
                        transition: 'all 0.2s',
                        '&:hover': {
                          backgroundColor:
                            activeSection === index ? 'primary.dark' : 'secondary.dark',
                          transform: 'translateX(4px)',
                          boxShadow: activeSection === index ? 2 : 1,
                        },
                        '&.Mui-selected': {
                          backgroundColor: 'primary.main',
                          '&:hover': { backgroundColor: 'primary.dark' },
                        },
                      }}
                    >
                      <ListItemText primary={section.title} />
                    </ListItemButton>
                  ))}

                  <ListItemButton
                    selected={activeSection === availableSections.length}
                    onClick={() => {
                      setActiveSection(availableSections.length);
                      reviewsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }}
                    sx={{
                      borderRadius: 1,
                      backgroundColor: activeSection === availableSections.length ? 'primary.main' : 'transparent',
                      color:
                        activeSection === availableSections.length
                          ? 'primary.contrastText'
                          : 'secondary.contrastText',
                      transition: 'all 0.2s',
                      '&:hover': {
                        backgroundColor:
                          activeSection === availableSections.length ? 'primary.dark' : 'secondary.dark',
                        transform: 'translateX(4px)',
                        boxShadow: activeSection === availableSections.length ? 2 : 1,
                      },
                      '&.Mui-selected': {
                        backgroundColor: 'primary.main',
                        '&:hover': { backgroundColor: 'primary.dark' },
                      },
                    }}
                  >
                    <ListItemText primary="Reviews" />
                  </ListItemButton>
                </List>
              </Box>
            </Box>

            <Divider sx={{ borderColor: 'rgba(255,255,255,0.2)' }} />

            <Box sx={{ py: 1, overflow: 'visible' }}>
              <Typography
                variant="subtitle2"
                sx={{ color: 'secondary.contrastText', mb: 1, px: 3, fontWeight: 600 }}
              >
                Quick Links
              </Typography>
              <Divider sx={{ borderColor: 'rgba(255,255,255,0.2)', mb: 1 }} />
              <List sx={{ overflow: 'visible', px: 2 }}>
                {program.main_page_url && (
                  <ListItemButton
                    component="a"
                    href={program.main_page_url}
                    target="_blank"
                    sx={{
                      borderRadius: 1,
                      mb: 0.5,
                      color: 'secondary.contrastText',
                      transition: 'all 0.2s',
                      '&:hover': {
                        backgroundColor: 'secondary.dark',
                        transform: 'translateX(4px)',
                        boxShadow: 1,
                      },
                    }}
                  >
                    <ListItemText primary="Program Page" />
                  </ListItemButton>
                )}
                {program.homepage_url && (
                  <ListItemButton
                    component="a"
                    href={program.homepage_url}
                    target="_blank"
                    sx={{
                      borderRadius: 1,
                      mb: 0.5,
                      color: 'secondary.contrastText',
                      transition: 'all 0.2s',
                      '&:hover': {
                        backgroundColor: 'secondary.dark',
                        transform: 'translateX(4px)',
                        boxShadow: 1,
                      },
                    }}
                  >
                    <ListItemText primary="Homepage" />
                  </ListItemButton>
                )}
                {program.budget_page_url && (
                  <ListItemButton
                    component="a"
                    href={program.budget_page_url}
                    target="_blank"
                    sx={{
                      borderRadius: 1,
                      mb: 0.5,
                      color: 'secondary.contrastText',
                      transition: 'all 0.2s',
                      '&:hover': {
                        backgroundColor: 'secondary.dark',
                        transform: 'translateX(4px)',
                        boxShadow: 1,
                      },
                    }}
                  >
                    <ListItemText primary="Budget Info" />
                  </ListItemButton>
                )}
              </List>
            </Box>
          </>
        )}
      </Box>

      <Box
        sx={{
          flex: 1,
          ml: menuOpen ? '280px' : '60px',
          p: 4,
          overflowY: 'auto',
          scrollMarginTop: '64px',
          transition: 'margin-left 0.3s ease',
        }}
      >
        <Paper elevation={0} sx={{ p: 4, borderRadius: 3 }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h3" fontWeight="600" gutterBottom>
              {program.program_details.name}
            </Typography>

            <Box
              component="img"
              src={program.img_url}
              alt={program.program_details.name}
              sx={{
                width: '100%',
                maxWidth: 600,
                height: 400,
                margin: '0 auto',
                borderRadius: 2,
                objectFit: 'contain',
              }}
            />
          </Box>

          {program.program_details.minimum_gpa && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Program Information
              </Typography>
              {program.program_details.program_type && (
                <Typography>Program Type: {program.program_details.program_type}</Typography>
              )}
              {program.program_details.academic_calendar && (
                <Typography>
                  Academic Calendar: {program.program_details.academic_calendar}
                </Typography>
              )}
              <Typography>Minimum GPA: {program.program_details.minimum_gpa}</Typography>
              {program.program_details.language_prerequisite && (
                <Typography>
                  Language Requirement: {program.program_details.language_prerequisite}
                </Typography>
              )}
              {program.program_details.additional_prerequisites && (
                <Typography>
                  Additional Prerequisites: {program.program_details.additional_prerequisites}
                </Typography>
              )}
              {program.program_details.housing && (
                <Typography>Housing: {program.program_details.housing}</Typography>
              )}
            </Box>
          )}

          <Divider sx={{ mt: 4 }} />

          {availableSections.length > 0 && (
            <Box sx={{ mt: 4 }}>
              {availableSections.map((section, sectionIndex) => (
                <Box
                  key={sectionIndex}
                  ref={(el) => (sectionRefs.current[sectionIndex] = el)}
                  sx={{ mb: 6, p: 2, px: 8, scrollMarginTop: '64px', '& a': { color: '#B49248' } }}
                >
                  <Typography variant="h4" gutterBottom sx={{ fontWeight: 500, mb: 3 }}>
                    {section.title}
                  </Typography>
                  {section.content.map((htmlContent, contentIndex) => (
                    <Box
                      key={contentIndex}
                      dangerouslySetInnerHTML={{ __html: htmlContent }}
                      sx={{
                        mb: 2,
                        fontSize: '1.4rem',
                        textAlign: 'left',
                        fontFamily: 'Libre Caslon Text',
                        lineHeight: 1.5,
                      }}
                    />
                  ))}
                  {sectionIndex < availableSections.length - 1 && <Divider sx={{ mt: 4 }} />}
                </Box>
              ))}
            </Box>
          )}

          <Divider sx={{ mt: 4 }} />

          <Box sx={{ mt: 6, px: 8 }} ref={reviewsRef}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 500, mb: 3 }}>
              Reviews
            </Typography>

            {program.reviews && program.reviews.length > 0 ? (
              <List>
                {program.reviews.map((review) => (
                  <Paper key={review.id} elevation={0} sx={{ p: 3, mb: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: 'secondary.main' }}>
                          {review.alumni_name.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {review.alumni_name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Class of {review.alumni_year} • {new Date(review.date).toLocaleDateString()}
                          </Typography>
                        </Box>
                      </Box>
                      <Rating value={review.rating} readOnly size="small" />
                    </Box>
                    <Typography variant="body1" sx={{ mt: 2, fontFamily: 'Libre Caslon Text' }}>
                      {review.text}
                    </Typography>
                  </Paper>
                ))}
              </List>
            ) : (
              <Typography variant="body1" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                No reviews yet.
              </Typography>
            )}
          </Box>
        </Paper>
      </Box>

      <Dialog open={reviewDialogOpen} onClose={handleCloseReviewDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Write a Review</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography component="legend">Rating</Typography>
              <Rating
                value={reviewRating}
                onChange={(event, newValue) => {
                  setReviewRating(newValue);
                }}
              />
            </Box>
            <TextField
              autoFocus
              margin="dense"
              label="Your Review"
              fullWidth
              multiline
              rows={4}
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              variant="outlined"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseReviewDialog} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleSubmitReview} variant="contained" disabled={submittingReview || !reviewText.trim()}>
            {submittingReview ? 'Submitting...' : 'Submit Review'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
