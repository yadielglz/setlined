import { createTheme } from '@mui/material/styles';

// Official T-Mobile Color Palette
const theme = createTheme({
   palette: {
     primary: {
       main: '#ED008C', // T-Mobile Magenta
       light: '#FF4DA6',
       dark: '#C00073',
       contrastText: '#FFFFFF',
     },
    secondary: {
      main: '#6C757D', // Cool Gray
      light: '#9CA3AF',
      dark: '#495057',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#FFFFFF', // T-Mobile White
      paper: '#FFFFFF',
    },
    text: {
      primary: '#000000', // T-Mobile Black
      secondary: '#6C757D',
    },
    error: {
      main: '#DC3545', // T-Mobile Error Red
    },
    warning: {
      main: '#FFC107', // T-Mobile Warning Yellow
    },
    success: {
      main: '#28A745', // T-Mobile Success Green
    },
    info: {
      main: '#17A2B8', // T-Mobile Info Blue
    },
  },
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
      lineHeight: 1.2,
    },
    h2: {
      fontWeight: 600,
      fontSize: '2rem',
      lineHeight: 1.3,
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.75rem',
      lineHeight: 1.4,
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.4,
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem',
      lineHeight: 1.5,
    },
    h6: {
      fontWeight: 600,
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
    button: {
      fontWeight: 500,
      textTransform: 'none',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1920,
    },
  },
});

export default theme;