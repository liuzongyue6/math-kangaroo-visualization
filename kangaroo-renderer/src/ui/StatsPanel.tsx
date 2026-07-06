import { Card, Stack, Typography } from '@mui/material';
import { useProblemStore } from '../stores/problemStore';
import type { ProblemConfig } from '../types/problem';

type StatsPanelProps = {
  config: ProblemConfig;
};

export function StatsPanel({ config }: StatsPanelProps) {
  const statsType = config.meta.stats_type;

  if (statsType === 'gear') {
    return <GearStats />;
  }
  if (statsType === 'coins') {
    return <CoinsStats />;
  }
  return null;
}

function GearStats() {
  const rotations = useProblemStore((s) => s.rotations);
  const smallAngle = rotations['small-gear'] ?? 0;

  const smallRotations = Math.abs(smallAngle / (Math.PI * 2));
  const largeRotations = smallRotations / 2;
  const aligned = smallRotations % 2 < 0.05 && smallRotations > 0.1;

  return (
    <Card sx={{ px: 4, py: 2, mb: 2 }}>
      <Stack direction="row" spacing={5}>
        <Stack sx={{ alignItems: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            Small Gear Rotations
          </Typography>
          <Typography variant="h6" color={aligned ? 'success.main' : 'error.main'}>
            {smallRotations.toFixed(1)}
          </Typography>
        </Stack>
        <Stack sx={{ alignItems: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            Large Gear Rotations
          </Typography>
          <Typography variant="h6" color={aligned ? 'success.main' : 'text.primary'}>
            {largeRotations.toFixed(1)}
          </Typography>
        </Stack>
      </Stack>
    </Card>
  );
}

function CoinsStats() {
  const coins = useProblemStore((s) => s.coins);
  const message = useProblemStore((s) => s.message);

  return (
    <Card sx={{ px: 4, py: 2, mb: 2, textAlign: 'center', minWidth: 220 }}>
      <Typography variant="caption" color="text.secondary">
        Coins Used
      </Typography>
      <Typography variant="h5">{coins}</Typography>
      {message && (
        <Typography variant="subtitle1" color="success.main" sx={{ fontWeight: 700, mt: 0.5 }}>
          {message}
        </Typography>
      )}
    </Card>
  );
}
