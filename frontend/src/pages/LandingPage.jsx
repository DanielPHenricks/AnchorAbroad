// src/pages/HomePage.jsx
import React from 'react';
import { Box, Button, Container, Typography, Stack, Grid, Paper } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { Search, AttachMoney, RateReview, People } from '@mui/icons-material';

const LandingPage = ({ user }) => {
  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: '100vh',
        bgcolor: 'background.default',
        color: 'common.white',
        overflow: 'hidden',
      }}
    >

      {/* background image */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'url(/florence.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          zIndex: 1,
        }}
      />


      {/* Dark gradient that “blends” the rest of the page into the background */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          zIndex: 2,
          background:
            'linear-gradient(to bottom, rgba(3,7,18,0.75) 0%, rgba(3,7,18,0.85) 40%, rgba(3,7,18,0.97) 70%, #050505 100%)',
        }}
      />

      {/* Hero content */}
      <Container
        maxWidth="lg"
        sx={{
          position: 'relative',
          zIndex: 3,
          pt: { xs: 14, md: 18 },
          pb: { xs: 10, md: 14 },
          textAlign: 'center',
        }}
      >
        <Stack
          direction="column"
          spacing={{ xs: 6, md: 8 }}
          alignItems="center"
        >
          <Box sx={{ maxWidth: 800, mx: 'auto' }}>
            <Typography
              variant="overline"
              sx={{
                letterSpacing: 3,
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.8)',
              }}
            >
              Study Abroad at Vanderbilt
            </Typography>

            <Typography
              variant="h2"
              sx={{
                mt: 2,
                fontWeight: 700,
                lineHeight: 1.1,
              }}
            >
              Explore the world.
              <br />
              Bring it back to campus.
            </Typography>

            <Typography
              variant="body1"
              sx={{
                mt: 3,
                mx: 'auto',
                maxWidth: 600,
                color: 'rgba(255,255,255,0.85)',
                fontSize: '1.125rem',
              }}
            >
              Browse over 150 programs across the globe, compare costs, and
              find the experience that fits your academic path and your sense of
              adventure.
            </Typography>

            <Stack
              direction="row"
              spacing={2}
              sx={{ mt: 5, justifyContent: 'center' }}
            >
              <Button
                variant="contained"
                color="secondary"
                size="large"
                component={RouterLink}
                sx={{
                  borderRadius: 12,
                  textTransform: 'none',
                  px: 4,
                  py: 1.5,
                  fontWeight: 600,
                  boxShadow: 0,
                }}
                to='/map'
              >
                Explore programs
              </Button>

              {!user && (
                <Button
                  variant="outlined"
                  size="large"
                  component={RouterLink}
                  to="/alumni"
                  sx={{
                    px: 3,
                    py: 1.5,
                    borderRadius: 12,
                    textTransform: 'none',
                    borderColor: 'rgba(255,255,255,0.6)',
                    color: 'rgba(255,255,255,0.9)',
                    fontWeight: 600,
                    '&:hover': {
                      borderColor: 'rgba(255,255,255,0.9)',
                      backgroundColor: 'rgba(255,255,255,0.06)',
                    },
                  }}
                >
                  Alumni Login
                </Button>
              )}
            </Stack>
          </Box>

        </Stack>
      </Container>

      {/* lower section that gradient fades into */}
      <Box
        sx={{
          mt: { xs: 4, md: 0 },
          pt: { xs: 8, md: 10 },
          pb: { xs: 10, md: 12 },
          px: { xs: 2, md: 0 },
          position: 'relative',
          zIndex: 3,
          bgcolor: '#050505',
          color: 'common.white',
          borderTopLeftRadius: { xs: 24, md: 40 },
          borderTopRightRadius: { xs: 24, md: 40 },
          boxShadow: '0 -20px 40px rgba(0,0,0,0.5)',
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              mb: 10,
              pb: 8,
              borderBottom: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <Grid container spacing={4} justifyContent="center">
              {[
                { label: 'Study Abroad Programs', value: '150+' },
                { label: 'Countries', value: '40+' },
                { label: 'Undergraduates Study Abroad', value: '50%' },
              ].map((stat, index) => (
                <Grid item xs={12} md={4} key={index}>
                  <Stack alignItems="center" spacing={1}>
                    <Typography variant="h2" sx={{ fontWeight: 700, color: '#CFAE70' }}>
                      {stat.value}
                    </Typography>
                    <Typography variant="overline" sx={{ letterSpacing: 2, color: 'rgba(255,255,255,0.6)' }}>
                      {stat.label}
                    </Typography>
                  </Stack>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* features */}
          <Grid container spacing={6} justifyContent="center">
            {[
              {
                icon: <Search fontSize="large" />,
                title: 'Find Your Program',
                desc: 'Discover the perfect match for your academic goals.',
              },
              {
                icon: <AttachMoney fontSize="large" />,
                title: 'View Budgets',
                desc: 'Transparent cost estimates to help you plan ahead.',
              },
              {
                icon: <RateReview fontSize="large" />,
                title: 'Read Reviews',
                desc: 'Honest feedback from students who have been there.',
              },
              {
                icon: <People fontSize="large" />,
                title: 'Chat with Anchor Buddy',
                desc: 'Connect with Anchor Buddy for personalized advice.',
              },
            ].map((item, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Box
                  sx={{
                    textAlign: 'center',
                    p: 4,
                    height: '150px',
                    width: '300px',
                    transition: 'all 0.3s ease',
                    borderRadius: 4,
                    bgcolor: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.05)',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      bgcolor: 'rgba(255,255,255,0.06)',
                      borderColor: 'rgba(255,255,255,0.2)',
                    },
                  }}
                >
                  <Box sx={{ color: '#CFAE70', mb: 2 }}>
                    {item.icon}
                  </Box>
                  <Typography variant="h6" sx={{ fontFamily: 'Libre Caslon Text', mb: 1.5, color: 'common.white' }}>
                    {item.title}
                  </Typography>
                  <Typography variant="body2" sx={{ lineHeight: 1.6, color: 'rgba(255,255,255,0.6)' }}>
                    {item.desc}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage;
