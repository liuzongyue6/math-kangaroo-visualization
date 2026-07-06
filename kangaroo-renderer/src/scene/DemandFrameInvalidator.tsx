import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { useProblemStore } from '../stores/problemStore';

export function DemandFrameInvalidator() {
  const { invalidate } = useThree();
  const isPlaying = useProblemStore((s) => s.isPlaying);
  const collected = useProblemStore((s) => s.collected);
  const driverAngles = useProblemStore((s) => s.driverAngles);
  const rotations = useProblemStore((s) => s.rotations);
  const coins = useProblemStore((s) => s.coins);

  useEffect(() => {
    invalidate();
  }, [invalidate]);

  useEffect(() => {
    invalidate();
  }, [isPlaying, collected, driverAngles, rotations, coins, invalidate]);

  return null;
}
