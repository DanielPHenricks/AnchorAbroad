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
} from '@mui/material';
import { Favorite, FavoriteBorder } from '@mui/icons-material';
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
        <Typography variant="h6" noWrap component="div">
          {selectedMarker.program_details?.name || 'Program'}
        </Typography>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Toolbar>

      <Divider />
      {isMyProgram && (
        <Box sx={{ p: 2 }}>
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
              Review My Program
            </Typography>
          </Box>
        </Box>
      )}

      {!isAlumni && (
        <Box sx={{ p: 2 }}>
          <Button
            fullWidth
            startIcon={isFavorite ? <Favorite sx={{ color: '#B49248' }} /> : <FavoriteBorder />}
            onClick={toggleFavorite}
            sx={{
              borderRadius: 12,
              textTransform: 'none',
              color: isFavorite ? '#B49248' : 'primary.main',
              borderColor: isFavorite ? '#B49248' : 'primary.main',
              backgroundColor: 'secondary.main',
            }}
          >
            {isFavorite ? 'Favorited' : 'Add to Favorites'}
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
    </Drawer>
  );
};

export default Sidebar;
