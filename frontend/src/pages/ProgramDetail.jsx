/**
 * Names: Daniel, Jacob, Maharshi, Ben
 * Time: 30 mins
 */

import { useParams } from 'react-router';
import { useState, useEffect, useRef } from 'react';
import { Typography, Box, Button, Paper, List, ListItemButton, ListItemText, Divider, IconButton } from '@mui/material';
import { Favorite, FavoriteBorder, ChevronLeft, ChevronRight } from '@mui/icons-material';
import apiService from '../services/api';

export default function ProgramDetail() {
  const { id } = useParams();
  const [program, setProgram] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState(0);
  const [menuOpen, setMenuOpen] = useState(true);
  const sectionRefs = useRef([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [programs, favoriteCheck] = await Promise.all([
          apiService.getPrograms(),
          apiService.checkFavorite(id).catch(() => ({ is_favorite: false })), // Handle auth errors gracefully
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

  const scrollToSection = (index) => {
    setActiveSection(index);
    sectionRefs.current[index]?.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
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

  return (
    <Box sx={{ p: 4, backgroundColor: '#f5f6fa', minHeight: '100vh' }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
        <Box
          sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}
        >
          <Typography variant="h4" fontWeight="600">
            {program.program_details.name}
          </Typography>
          <Button
            variant="outlined"
            startIcon={isFavorite ? <Favorite /> : <FavoriteBorder />}
            onClick={toggleFavorite}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              color: isFavorite ? '#d32f2f' : 'primary.main',
              borderColor: isFavorite ? '#d32f2f' : 'primary.main',
            }}
          >
            {isFavorite ? 'Favorited' : 'Add to Favorites'}
          </Button>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Program Information
          </Typography>
          {program.program_details.program_type && (
            <Chip label={program.program_details.program_type} sx={{ mr: 1, mb: 1 }} />
          )}
          {program.program_details.academic_calendar && (
            <Chip label={program.program_details.academic_calendar} sx={{ mr: 1, mb: 1 }} />
          )}
        </Box>

        {program.program_details.minimum_gpa && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Requirements
            </Typography>
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
          </Box>
        )}

        {program.program_details.housing && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Housing
            </Typography>
            <Typography>{program.program_details.housing}</Typography>
          </Box>
        )}

        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          {program.main_page_url && (
            <Button variant="contained" href={program.main_page_url} target="_blank">
              Vanderbilt Program
            </Button>
          )}
          {program.homepage_url && (
            <Button variant="outlined" href={program.homepage_url} target="_blank">
              Program Homepage
            </Button>
          )}
          {program.budget_page_url && (
            <Button variant="outlined" href={program.budget_page_url} target="_blank">
              Budget Info
            </Button>
          )}
        </Paper>
      </Box>
    </Box>
  );
}
