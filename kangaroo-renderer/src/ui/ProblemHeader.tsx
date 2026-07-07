import { Box, Typography } from '@mui/material';
import type { ProblemMeta } from '../types/problem';

type ProblemHeaderProps = {
  meta: ProblemMeta;
};

export function ProblemHeader({ meta }: ProblemHeaderProps) {
  return (
    <Box sx={{ textAlign: 'center', mb: 2, px: 2 }}>
      <Typography variant="h5" component="h1" sx={{ mb: meta.description ? 0.5 : 0 }}>
        {meta.id}
      </Typography>
      {meta.description && (
        <Typography variant="body1" color="text.secondary">
          {meta.description}
        </Typography>
      )}
    </Box>
  );
}
