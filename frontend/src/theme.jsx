import { createTheme } from '@mui/material/styles';

const easeOutExpo = 'cubic-bezier(0.16, 1, 0.3, 1)';

const theme = createTheme({
  palette: {
    primary: { main: '#1C1C1C', light: '#1C1C1C', dark: '#1C1C1C', contrastText: '#e0d5c0' },
    secondary: { main: '#f5f3ef', dark: '#CFAE70', grey: '#E4E4E4', contrastText: '#1C1C1C' },
  },
  typography: {
    h1: { fontFamily: '"Libre Caslon Text", serif' },
    h2: { fontFamily: '"Libre Caslon Text", serif' },
    h3: { fontFamily: '"Libre Caslon Text", serif' },
    h4: { fontFamily: '"Libre Caslon Text", serif' },
    h5: { fontFamily: '"Libre Caslon Text", serif' },
    h6: { fontFamily: '"Libre Caslon Text", serif' },
    body1: { fontFamily: 'Inter, Arial, sans-serif' },
    body2: { fontFamily: 'Inter, Arial, sans-serif' },
    button: { fontFamily: 'Inter, Arial, sans-serif' },
    caption: { fontFamily: 'Inter, Arial, sans-serif' },
    overline: { fontFamily: 'Inter, Arial, sans-serif' },
  },

  transitions: {
    easing: {
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeOut: easeOutExpo,
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
    },
    duration: {
      enteringScreen: 200,
      leavingScreen: 200,
      shortest: 150,
      shorter: 200,
      short: 250,
      standard: 300,
      complex: 375,
    },
  },

  components: {
    MuiDrawer: {
      defaultProps: {
        slotProps: {
          transition: {
            timeout: 200,
            easing: {
              enter: easeOutExpo,
              exit: easeOutExpo,
            },
          },
        },
      },
    },
  },
});

export default theme;
