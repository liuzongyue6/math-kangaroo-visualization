import { useEffect } from 'react';
import { Box, Paper, Stack } from '@mui/material';
import { Canvas } from '@react-three/fiber';
import type { ProblemConfig } from '../types/problem';
import { useProblemStore } from '../stores/problemStore';
import { SceneInterpreter } from '../scene/SceneInterpreter';
import { ProblemHeader } from '../ui/ProblemHeader';
import { StatsPanel } from '../ui/StatsPanel';
import { ControlBar } from '../ui/ControlBar';
import { HistoryPanel } from '../ui/HistoryPanel';

type ProblemPlayerProps = {
  config: ProblemConfig;
};

export function ProblemPlayer({ config }: ProblemPlayerProps) {
  const init = useProblemStore((s) => s.init);

  useEffect(() => {
    init(config.scene.initial_state, config.meta.params);
  }, [config, init]);

  const { viewport_width, viewport_height } = config.camera;

  return (
    <Stack sx={{ width: '100%', maxWidth: 640, alignItems: 'center' }}>
      <ProblemHeader meta={config.meta} />
      <StatsPanel config={config} />
      <Paper
        elevation={3}
        sx={{
          width: viewport_width,
          maxWidth: '100%',
          height: viewport_height,
          borderRadius: 4,
          overflow: 'hidden',
          mb: 3,
        }}
      >
        <Box sx={{ width: '100%', height: '100%' }}>
          <Canvas frameloop="demand" shadows gl={{ antialias: true }}>
            <color attach="background" args={['#ffffff']} />
            <SceneInterpreter
              config={config.scene}
              camera={config.camera}
              meta={config.meta}
            />
          </Canvas>
        </Box>
      </Paper>
      <ControlBar meta={config.meta} config={config} />
      <HistoryPanel meta={config.meta} />
    </Stack>
  );
}
