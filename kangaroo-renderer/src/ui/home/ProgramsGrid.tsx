import { Box, Typography } from '@mui/material';
import { PROGRAM_CARDS } from './homeContent';
import { ProgramCard } from './ProgramCard';

type ProgramsGridProps = {
  onSelectProgram: (id: string) => void;
};

/** Always a single vertical column, top to bottom, regardless of screen
 * size — cards are listed in priority order (see PROGRAM_CARDS). */
export function ProgramsGrid({ onSelectProgram }: ProgramsGridProps) {
  return (
    <Box component="section" sx={{ maxWidth: 1080, mx: 'auto', px: 3, py: { xs: 5, sm: 7 } }}>
      <Typography variant="h4" sx={{ fontWeight: 700, textAlign: 'center', mb: { xs: 3, sm: 4 } }}>
        课程模块 · Programs
      </Typography>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: 3,
          maxWidth: 640,
          mx: 'auto',
        }}
      >
        {PROGRAM_CARDS.map((card) => (
          <ProgramCard key={card.id} data={card} onSelect={() => onSelectProgram(card.id)} />
        ))}
      </Box>
    </Box>
  );
}
