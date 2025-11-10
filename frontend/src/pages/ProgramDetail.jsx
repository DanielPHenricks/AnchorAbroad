/**
 * Names: Daniel, Jacob, Maharshi, Ben
 * Time: 30 mins
 */

import { useParams } from 'react-router';
import { useState, useEffect, useRef } from 'react';
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
} from '@mui/material';
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
            <Box sx={{ px: 2, pb: 2 }}>
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

            <Divider sx={{ borderColor: 'rgba(255,255,255,0.2)' }} />

            {availableSections.length > 0 && (
              <Box sx={{ overflow: 'hidden' }}>
                <Box sx={{ px: 2, py: 2 }}>
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
                  </List>
                </Box>
              </Box>
            )}

            <Divider sx={{ borderColor: 'rgba(255,255,255,0.2)' }} />

            <Box sx={{ px: 2, py: 2, overflow: 'visible' }}>
              <Typography
                variant="subtitle2"
                sx={{ color: 'secondary.contrastText', mb: 1, px: 1, fontWeight: 600 }}
              >
                Quick Links
              </Typography>
              <List sx={{ overflow: 'visible' }}>
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
        </Paper>
      </Box>
    </Box>
  );
}
