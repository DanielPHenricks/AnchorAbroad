import React, { useMemo, useState, useEffect } from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Divider,
  Box,
  IconButton,
  Collapse,
  Button,
  Link,
  Rating,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import { Favorite, FavoriteBorder, RateReview } from '@mui/icons-material';
import CloseIcon from '@mui/icons-material/Close';
import { CalendarMonthOutlined, School } from '@mui/icons-material';
import { SchoolOutlined } from '@mui/icons-material';
import { LanguageOutlined } from '@mui/icons-material';
import { ApartmentOutlined } from '@mui/icons-material';
import { AccountBalanceOutlined } from '@mui/icons-material';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import DescriptionIcon from '@mui/icons-material/Description';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import apiService from '../services/api';
import { useAlumni } from '../contexts/AlumniContext';

const drawerWidth = 400;

const Sidebar = ({ open, onClose, selectedMarker }) => {
  const { isAuthenticated: isAlumni, alumni } = useAlumni();
  const [isFavorite, setIsFavorite] = useState(false);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (selectedMarker?.program_id) {
        try {
          const isFav = await apiService.checkFavorite(selectedMarker.program_id);
          setIsFavorite(isFav.is_favorite);
        } catch (err) {
          console.error('Error checking favorite status:', err);
          setIsFavorite(false);
        }
      } else {
        setIsFavorite(false);
      }
    };

    checkFavoriteStatus();
  }, [selectedMarker]);

  const toggleFavorite = async () => {
    try {
      if (isFavorite) {
        await apiService.removeFavorite(selectedMarker.program_id);
        setIsFavorite(false);
      } else {
        await apiService.addFavorite(selectedMarker.program_id);
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
      await apiService.addReview(selectedMarker.program_id, {
        text: reviewText,
        rating: reviewRating,
      });

      // Note: We can't easily update the selectedMarker state from here without a callback from parent.
      // For now, we'll just close the dialog. Ideally, we should trigger a refresh.
      alert('Review submitted successfully!');

      handleCloseReviewDialog();
    } catch (err) {
      console.error('Error submitting review:', err);
      alert('Failed to submit review. Please try again.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const hasSectionContent = (content) => {
    if (Array.isArray(content)) {
      console.log(content.some((item) => typeof item === 'string' && item.trim() != ''));
      return content.some((item) => typeof item === 'string' && item.trim() != '');
    }
    return typeof content === 'string' && content.trim() !== '';
  };

  // get first section with content
  const displaySection = useMemo(() => {
    if (!selectedMarker || !selectedMarker.sections) return null;
    return selectedMarker.sections.find((s) => hasSectionContent(s?.content)) || null;
  }, [selectedMarker]);

  if (!selectedMarker) return null;

  // Check if this is the alumni's program
  const isMyProgram = isAlumni && alumni?.program?.program_id === selectedMarker.program_id;

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      variant="temporary"
      sx={{
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          backgroundColor: '#FFFFFF',
          color: '#333',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, mr: 2 }}>
          {selectedMarker.program_details?.name || 'Program'}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {!isAlumni && (
            <IconButton onClick={toggleFavorite} sx={{ mr: 1 }}>
              {isFavorite ? <Favorite sx={{ color: '#B49248' }} /> : <FavoriteBorder />}
            </IconButton>
          )}
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </Toolbar>

      <Divider />
      {isMyProgram && (
        <Box sx={{ p: 2 }}>
          <Button
            fullWidth
            variant="contained"
            startIcon={<RateReview />}
            onClick={handleOpenReviewDialog}
            sx={{
              borderRadius: 12,
              textTransform: 'none',
              backgroundColor: '#B49248',
              color: 'white',
              '&:hover': {
                backgroundColor: '#9a7b3b',
              },
            }}
          >
            Review My Program
          </Button>
        </Box>
      )}


      <Divider />

      <Box sx={{ overflow: 'auto', p: 2, flexGrow: 1 }}>
        {/* Program details */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <AccountBalanceOutlined fontSize="small" />
          <Typography variant="body2">
            Program Type: {selectedMarker.program_details?.program_type || '—'}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <CalendarMonthOutlined fontSize="small" />
          <Typography variant="body2">
            Academic Calendar: {selectedMarker.program_details?.academic_calendar || '—'}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <SchoolOutlined fontSize="small" />
          <Typography variant="body2">
            Minimum GPA: {selectedMarker.program_details?.minimum_gpa || '—'}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <LanguageOutlined fontSize="small" />
          <Typography variant="body2">
            Language Prerequisite: {selectedMarker.program_details?.language_prerequisite || '—'}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <ApartmentOutlined fontSize="small" />
          <Typography variant="body2">
            Housing: {selectedMarker.program_details?.housing || '—'}
          </Typography>
        </Box>

        {selectedMarker.reviews && selectedMarker.reviews.length > 0 && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Rating value={selectedMarker.reviews.reduce((acc, r) => acc + r.rating, 0) / selectedMarker.reviews.length} readOnly size="small" precision={0.5} />
            <Typography variant="body2" color="text.secondary">
              ({selectedMarker.reviews.length} reviews)
            </Typography>
          </Box>
        )}

        <Divider sx={{ mb: 2 }} />

        {/* overview section */}
        {displaySection && (
          <Box>
            <Typography variant="h6" sx={{ textAlign: 'center' }}>
              {displaySection.title}
            </Typography>
            <Box>
              {Array.isArray(displaySection.content) ? (
                displaySection.content.map((htmlContent, i) => (
                  <Box
                    key={i}
                    dangerouslySetInnerHTML={{ __html: htmlContent }}
                    sx={{
                      fontFamily: '"Libre Caslon Text"',
                      '& p': { mb: 1 },
                      '& ul': { pl: 2, mb: 1 },
                      '& li': { mb: 0.5 },
                      '& a': {
                        color: 'primary.main',
                        textDecoration: 'none',
                        '&:hover': { textDecoration: 'underline' },
                      },
                    }}
                  />
                ))
              ) : (
                <Box
                  dangerouslySetInnerHTML={{ __html: displaySection.content }}
                  sx={{
                    '& p': { mb: 1 },
                    '& ul': { pl: 2, mb: 1 },
                    '& li': { mb: 0.5 },
                    '& a': {
                      color: 'primary.main',
                      textDecoration: 'none',
                      '&:hover': { textDecoration: 'underline' },
                    },
                  }}
                />
              )}
            </Box>
          </Box>
        )}
      </Box>

      {/* Bottom button */}
      <Divider />
      <Box sx={{ p: 2 }}>
        <Button
          fullWidth
          variant="outlined"
          startIcon={<OpenInNewIcon />}
          component={Link}
          href={`../programs/${selectedMarker.program_id}`}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            color: 'primary.main',
            borderColor: 'primary.main',
          }}
        >
          More Details
        </Button>
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
    </Drawer>
  );
};

export default Sidebar;
