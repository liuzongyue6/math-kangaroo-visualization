import { Card, Stack, Typography } from '@mui/material';
import { useProblemStore } from '../stores/problemStore';
import type { CircularJumpBehavior, ProblemConfig } from '../types/problem';

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
  if (statsType === 'jump') {
    return <JumpStats config={config} />;
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

function JumpStats({ config }: { config: ProblemConfig }) {
  const turnCount = useProblemStore((s) => s.turnCount);
  const jumpFinishedTurn = useProblemStore((s) => s.jumpFinishedTurn);

  const racers = config.scene.entities
    .map((entity) => ({
      entity,
      behavior: entity.behaviors.find(
        (b): b is CircularJumpBehavior => b.kind === 'circular_jump',
      ),
    }))
    .filter((r): r is { entity: typeof r.entity; behavior: CircularJumpBehavior } =>
      Boolean(r.behavior),
    );

  const finishedTurns = racers
    .map((r) => jumpFinishedTurn[r.entity.id])
    .filter((t): t is number => t != null);
  const bestTurn = finishedTurns.length > 0 ? Math.min(...finishedTurns) : null;
  const winners = racers.filter(
    (r) => bestTurn != null && jumpFinishedTurn[r.entity.id] === bestTurn,
  );

  return (
    <Card sx={{ px: 4, py: 2, mb: 2 }}>
      <Stack spacing={1.5}>
        <Stack sx={{ alignItems: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            Turn
          </Typography>
          <Typography variant="h6">{turnCount}</Typography>
        </Stack>
        <Stack direction="row" spacing={4} sx={{ justifyContent: 'center' }}>
          {racers.map(({ entity, behavior }) => {
            const finishedAt = jumpFinishedTurn[entity.id];
            return (
              <Stack key={entity.id} sx={{ alignItems: 'center', minWidth: 96 }}>
                <Typography variant="h5">{entity.label?.text ?? entity.id}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {behavior.step} space{behavior.step > 1 ? 's' : ''}/jump
                </Typography>
                <Typography
                  variant="body2"
                  color={finishedAt != null ? 'success.main' : 'text.primary'}
                  sx={{ fontWeight: finishedAt != null ? 700 : 400 }}
                >
                  {finishedAt != null ? `Landed in ${finishedAt} jumps!` : 'Racing…'}
                </Typography>
              </Stack>
            );
          })}
        </Stack>
        {winners.length > 0 && (
          <Typography variant="subtitle1" color="success.main" sx={{ fontWeight: 700, textAlign: 'center' }}>
            {winners.map((w) => w.entity.label?.text ?? w.entity.id).join(' & ')} wins in{' '}
            {bestTurn} jump{bestTurn === 1 ? '' : 's'}!
          </Typography>
        )}
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
