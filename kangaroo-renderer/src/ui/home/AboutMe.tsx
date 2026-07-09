import SchoolIcon from '@mui/icons-material/School';
import { Avatar, Box, Stack, Typography } from '@mui/material';
import { ABOUT_ME, GITHUB_USERNAME } from './homeContent';

export function AboutMe() {
  const avatarUrl = `https://github.com/${GITHUB_USERNAME}.png`;

  return (
    <Box component="section" sx={{ maxWidth: 900, mx: 'auto', px: 3, py: { xs: 5, sm: 7 } }}>
      <Typography variant="h4" sx={{ fontWeight: 700, textAlign: 'center', mb: { xs: 3, sm: 4 } }}>
        关于我 · About the Instructor
      </Typography>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={4}
        sx={{ alignItems: { xs: 'center', sm: 'flex-start' } }}
      >
        <Avatar
          src={avatarUrl}
          alt="MathZone instructor"
          sx={{ width: 128, height: 128, boxShadow: '0 6px 20px rgba(31, 36, 48, 0.15)' }}
        >
          <SchoolIcon sx={{ fontSize: 56 }} />
        </Avatar>
        <Stack component="ul" spacing={1.25} sx={{ m: 0, pl: 3, flex: 1 }}>
          {ABOUT_ME.bullets.map((bullet) => (
            <Typography key={bullet} component="li" variant="body1" color="text.secondary">
              {bullet}
            </Typography>
          ))}
        </Stack>
      </Stack>
    </Box>
  );
}
