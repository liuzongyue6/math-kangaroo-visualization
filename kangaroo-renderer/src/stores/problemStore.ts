import { create } from 'zustand';
import type { ProblemState } from '../types/problem';

type ProblemStore = ProblemState & {
  initialState: ProblemState | null;
  setIsPlaying: (playing: boolean) => void;
  toggleExploded: () => void;
  incrementCoin: () => void;
  addHistory: (color: string) => void;
  setRotation: (id: string, val: number) => void;
  setDriverAngle: (id: string, val: number) => void;
  markCollected: (id: string) => void;
  setMessage: (msg: string) => void;
  reset: () => void;
  init: (state: ProblemState) => void;
};

const defaultState: ProblemState = {
  isPlaying: true,
  isExploded: false,
  coins: 0,
  history: [],
  rotations: {},
  collected: [],
  message: '',
  driverAngles: {},
};

function cloneState(state: ProblemState): ProblemState {
  return structuredClone(state);
}

export const useProblemStore = create<ProblemStore>((set, get) => ({
  ...defaultState,
  initialState: null,

  setIsPlaying: (playing) => set({ isPlaying: playing }),

  toggleExploded: () => set((s) => ({ isExploded: !s.isExploded })),

  incrementCoin: () => set((s) => ({ coins: s.coins + 1 })),

  addHistory: (color) => set((s) => ({ history: [...s.history, color] })),

  setRotation: (id, val) =>
    set((s) => ({ rotations: { ...s.rotations, [id]: val } })),

  setDriverAngle: (id, val) =>
    set((s) => ({ driverAngles: { ...s.driverAngles, [id]: val } })),

  markCollected: (id) =>
    set((s) => ({ collected: [...s.collected, id] })),

  setMessage: (msg) => set({ message: msg }),

  reset: () => {
    const initial = get().initialState;
    if (initial) {
      const restored = cloneState(initial);
      set({ ...restored, initialState: initial });
    }
  },

  init: (state) => {
    const snapshot = cloneState({ ...defaultState, ...state });
    set({ ...cloneState(snapshot), initialState: snapshot });
  },
}));
