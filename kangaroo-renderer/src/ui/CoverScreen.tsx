import { useEffect, useState } from 'react';
import { Box, Button, Stack, Typography } from '@mui/material';

type CoverScreenProps = {
  onEnter: () => void;
};

/** Small background kangaroos hopping in place at staggered delays/sizes to
 * give the cover a lively "jumping around" feel without competing with the
 * main hero kangaroo. */
const MINI_KANGAROOS: { left: string; size: number; delay: string; opacity: number }[] = [
  { left: '18%', size: 26, delay: '0s', opacity: 0.5 },
  { left: '38%', size: 20, delay: '0.18s', opacity: 0.35 },
  { left: '64%', size: 30, delay: '0.32s', opacity: 0.45 },
  { left: '82%', size: 22, delay: '0.1s', opacity: 0.4 },
];

export function CoverScreen({ onEnter }: CoverScreenProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <Box
      onClick={onEnter}
      role="button"
      aria-label="Enter Math Kangaroo Visualizations"
      sx={{
        position: 'fixed',
        inset: 0,
        zIndex: 2000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: { xs: 2, sm: 3 },
        overflow: 'hidden',
        cursor: 'pointer',
        background: 'linear-gradient(135deg, #3f51b5 0%, #00a389 100%)',
        px: 3,
        textAlign: 'center',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: { xs: '10%', sm: '14%' },
          left: 0,
          right: 0,
          height: 60,
          pointerEvents: 'none',
        }}
      >
        {MINI_KANGAROOS.map((k) => (
          <Box
            key={k.left}
            className="mk-cover-hop"
            sx={{
              position: 'absolute',
              left: k.left,
              fontSize: k.size,
              opacity: k.opacity,
              animationDelay: k.delay,
            }}
          >
            🦘
          </Box>
        ))}
      </Box>

      <Box
        className="mk-cover-track"
        sx={{ position: 'relative', width: '100%', maxWidth: 900, height: 120, pointerEvents: 'none' }}
      >
        <Box className="mk-cover-drift" sx={{ position: 'absolute', left: '50%', bottom: 0 }}>
          <Box className="mk-cover-flip" sx={{ display: 'inline-block' }}>
            <Box
              component="span"
              className="mk-cover-hop"
              sx={{ fontSize: { xs: 64, sm: 84 }, display: 'inline-block' }}
            >
              🦘
            </Box>
          </Box>
        </Box>
      </Box>

      <Stack
        spacing={1.5}
        sx={{
          alignItems: 'center',
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(16px)',
          transition: 'opacity 0.6s ease, transform 0.6s ease',
        }}
      >
        <Typography
          variant="h3"
          sx={{ color: '#fff', fontWeight: 800, letterSpacing: 0.5, fontSize: { xs: '1.8rem', sm: '3rem' } }}
        >
          🦘 Math Kangaroo Visualizations
        </Typography>
        <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.85)' }}>
          跟着袋鼠一起跳进数学世界 · Hop into interactive math problems
        </Typography>
        <Button
          variant="contained"
          size="large"
          onClick={(e) => {
            e.stopPropagation();
            onEnter();
          }}
          sx={{
            mt: 1,
            bgcolor: '#fff',
            color: '#2c387e',
            fontWeight: 700,
            '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' },
          }}
        >
          开始探索 · Start Exploring
        </Button>
        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.65)' }}>
          点击任意处继续
        </Typography>
      </Stack>
    </Box>
  );
}
