import { Stack, Button, Slider, TextField, Typography } from '@mui/material';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import PauseRoundedIcon from '@mui/icons-material/PauseRounded';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';
import UnfoldMoreRoundedIcon from '@mui/icons-material/UnfoldMoreRounded';
import UnfoldLessRoundedIcon from '@mui/icons-material/UnfoldLessRounded';
import DirectionsRunRoundedIcon from '@mui/icons-material/DirectionsRunRounded';
import { useProblemStore } from '../stores/problemStore';
import type { CircularJumpBehavior, ProblemConfig, ProblemMeta } from '../types/problem';

type ControlBarProps = {
  meta: ProblemMeta;
  config?: ProblemConfig;
};

export function ControlBar({ meta, config }: ControlBarProps) {
  const isPlaying = useProblemStore((s) => s.isPlaying);
  const setIsPlaying = useProblemStore((s) => s.setIsPlaying);
  const isExploded = useProblemStore((s) => s.isExploded);
  const toggleExploded = useProblemStore((s) => s.toggleExploded);
  const foldAngle = useProblemStore((s) => s.foldAngle);
  const setFoldAngle = useProblemStore((s) => s.setFoldAngle);
  const isJumping = useProblemStore((s) => s.isJumping);
  const jumpFinishedTurn = useProblemStore((s) => s.jumpFinishedTurn);
  const stepTurn = useProblemStore((s) => s.stepTurn);
  const reset = useProblemStore((s) => s.reset);
  const paramValues = useProblemStore((s) => s.paramValues);
  const setParam = useProblemStore((s) => s.setParam);

  const params = meta.params ?? [];

  const hasPlay = meta.controls.includes('play');
  const hasReset = meta.controls.includes('reset');
  const hasExplode = meta.controls.includes('explode');
  const hasFold = meta.controls.includes('fold');
  const hasStep = meta.controls.includes('step');

  const racerIds = (config?.scene.entities ?? [])
    .filter((e) => e.behaviors.some((b): b is CircularJumpBehavior => b.kind === 'circular_jump'))
    .map((e) => e.id);
  const raceComplete =
    racerIds.length > 0 && racerIds.every((id) => jumpFinishedTurn[id] != null);

  const handleReset = () => {
    reset();
    if (hasPlay) {
      setIsPlaying(true);
    }
  };

  const handleParamChange = (id: string, raw: string, min: number, max: number) => {
    const parsed = Number(raw);
    if (!Number.isFinite(parsed)) return;
    const clamped = Math.min(max, Math.max(min, Math.round(parsed)));
    if (clamped !== paramValues[id]) {
      setParam(id, clamped);
    }
  };

  return (
    <Stack spacing={2} sx={{ mb: 3, width: '100%', alignItems: 'center' }}>
      {params.length > 0 && (
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
          {params.map((p) => (
            <Stack key={p.id} direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                {p.label}
              </Typography>
              <TextField
                type="number"
                size="small"
                value={paramValues[p.id] ?? p.default}
                onChange={(e) => handleParamChange(p.id, e.target.value, p.min, p.max)}
                slotProps={{ htmlInput: { min: p.min, max: p.max, step: p.step } }}
                sx={{ width: 92 }}
              />
            </Stack>
          ))}
        </Stack>
      )}
      <Stack direction="row" spacing={2}>
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
        {hasStep && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<DirectionsRunRoundedIcon />}
            onClick={stepTurn}
            disabled={isJumping || raceComplete}
          >
            {raceComplete ? 'Race Finished' : 'Jump! (Next Turn)'}
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
      {hasFold && (
        <Stack direction="row" spacing={2} sx={{ width: '100%', maxWidth: 480, alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary" sx={{ minWidth: 76 }}>
            Fold flat
          </Typography>
          <Slider
            value={foldAngle}
            onChange={(_, val) => setFoldAngle(val as number)}
            min={-90}
            max={90}
            step={1}
            marks={[{ value: -90 }, { value: 0 }, { value: 90 }]}
          />
          <Typography variant="body2" color="text.secondary" sx={{ minWidth: 76, textAlign: 'right' }}>
            Fold closed
          </Typography>
          <Typography variant="body2" sx={{ minWidth: 44, fontWeight: 700, textAlign: 'right' }}>
            {foldAngle}°
          </Typography>
        </Stack>
      )}
    </Stack>
  );
}
