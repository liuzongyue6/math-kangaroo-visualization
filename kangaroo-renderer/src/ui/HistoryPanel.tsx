import { Box, Grow, Paper, Stack, Typography } from '@mui/material';
import { useProblemStore } from '../stores/problemStore';
import type { ProblemMeta } from '../types/problem';

const COLOR_MAP: Record<string, string> = {
  blue: '#3fa9ff',
  yellow: '#ffd63d',
  white: '#ffffff',
};

type HistoryPanelProps = {
  meta: ProblemMeta;
};

export function HistoryPanel({ meta }: HistoryPanelProps) {
  const history = useProblemStore((s) => s.history);

  if (meta.stats_type !== 'coins') return null;

  return (
    <Box sx={{ width: '100%', maxWidth: 460, textAlign: 'center' }}>
      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
        Collected Balls
      </Typography>
      <Paper
        variant="outlined"
        sx={{
          minHeight: 76,
          p: 1.5,
          borderStyle: 'dashed',
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Stack
          direction="row"
          spacing={1}
          sx={{ flexWrap: 'wrap', justifyContent: 'flex-start' }}
        >
          {history.map((color, i) => (
            <Grow in appear key={`${i}-${color}`} timeout={400}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  bgcolor: COLOR_MAP[color] ?? '#cccccc',
                  border: '2px solid rgba(31, 36, 48, 0.25)',
                  boxShadow: '0 2px 6px rgba(31, 36, 48, 0.15)',
                }}
              />
            </Grow>
          ))}
        </Stack>
      </Paper>
    </Box>
  );
}
