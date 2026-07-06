import { createTheme } from '@mui/material/styles';

/** Material Design theme tuned for an educational visualization product:
 * softer, friendlier palette than stock Material blue, generous rounding,
 * gentle elevation so the DOM shell feels calm next to the 3D scene. */
export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#3f51b5',
      light: '#7986cb',
      dark: '#2c387e',
    },
    secondary: {
      main: '#00a389',
    },
    success: {
      main: '#2e9e5b',
    },
    error: {
      main: '#e0524d',
    },
    background: {
      default: '#f3f5f9',
      paper: '#ffffff',
    },
    text: {
      primary: '#1f2430',
      secondary: '#5b6472',
    },
  },
  shape: {
    borderRadius: 16,
  },
  typography: {
    fontFamily: [
      'Roboto',
      'system-ui',
      '-apple-system',
      'Segoe UI',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: { fontWeight: 700 },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    button: { fontWeight: 600, textTransform: 'none' },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          paddingLeft: 24,
          paddingRight: 24,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 6px 24px rgba(31, 36, 48, 0.08)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
        },
      },
    },
  },
});
