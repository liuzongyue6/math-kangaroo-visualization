import { Box, Typography } from '@mui/material';
import { BRAND } from './homeContent';
import { SocialLinks } from './SocialLinks';

/** Top hero band: brand wordmark, tagline, and follow-us social icons. */
export function BrandHero() {
  return (
    <Box
      sx={{
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #3f51b5 0%, #00a389 100%)',
        color: '#fff',
        textAlign: 'center',
        px: 3,
        py: { xs: 6, sm: 8 },
      }}
    >
      <Typography
        variant="h2"
        sx={{
          fontWeight: 800,
          letterSpacing: 0.5,
          fontSize: { xs: '2.4rem', sm: '3.4rem' },
        }}
      >
        {BRAND.name}
      </Typography>
      <Typography
        variant="h6"
        sx={{ mt: 1.5, fontWeight: 600, color: 'rgba(255,255,255,0.95)' }}
      >
        {BRAND.tagline}
      </Typography>
      <Typography variant="body2" sx={{ mt: 0.5, color: 'rgba(255,255,255,0.75)' }}>
        {BRAND.taglineEn}
      </Typography>
      <Box sx={{ mt: 3 }}>
        <SocialLinks />
      </Box>
    </Box>
  );
}
