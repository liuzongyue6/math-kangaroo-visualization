import { Stack, Button } from '@mui/material';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import PauseRoundedIcon from '@mui/icons-material/PauseRounded';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';
import UnfoldMoreRoundedIcon from '@mui/icons-material/UnfoldMoreRounded';
import UnfoldLessRoundedIcon from '@mui/icons-material/UnfoldLessRounded';
import { useProblemStore } from '../stores/problemStore';
import type { ProblemMeta } from '../types/problem';

type ControlBarProps = {
  meta: ProblemMeta;
};

export function ControlBar({ meta }: ControlBarProps) {
  const isPlaying = useProblemStore((s) => s.isPlaying);
  const setIsPlaying = useProblemStore((s) => s.setIsPlaying);
  const isExploded = useProblemStore((s) => s.isExploded);
  const toggleExploded = useProblemStore((s) => s.toggleExploded);
  const reset = useProblemStore((s) => s.reset);

  const hasPlay = meta.controls.includes('play');
  const hasReset = meta.controls.includes('reset');
  const hasExplode = meta.controls.includes('explode');

  const handleReset = () => {
    reset();
    if (hasPlay) {
      setIsPlaying(true);
    }
  };

  return (
    <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
      {hasPlay && (
        <Button
          variant="contained"
          color="primary"
          startIcon={isPlaying ? <PauseRoundedIcon /> : <PlayArrowRoundedIcon />}
          onClick={() => setIsPlaying(!isPlaying)}
        >
          {isPlaying ? 'Pause' : 'Play'}
        </Button>
      )}
      {hasReset && (
        <Button
          variant="outlined"
          color="primary"
          startIcon={<RestartAltRoundedIcon />}
          onClick={handleReset}
        >
          Reset
        </Button>
      )}
      {hasExplode && (
        <Button
          variant="contained"
          color={isExploded ? 'error' : 'primary'}
          startIcon={isExploded ? <UnfoldLessRoundedIcon /> : <UnfoldMoreRoundedIcon />}
          onClick={toggleExploded}
        >
          {isExploded ? 'Assemble' : 'Explode'}
        </Button>
      )}
    </Stack>
  );
}
