import { create } from 'zustand';
import type { ParamSpec, ProblemState } from '../types/problem';

// Shared duration for a single "turn" hop animation (see
// useCircularJumpBehavior). The Jump button stays disabled for this long so
// racers can't be advanced mid-animation.
export const JUMP_DURATION_MS = 500;

type ProblemStore = ProblemState & {
  initialState: ProblemState | null;
  setIsPlaying: (playing: boolean) => void;
  toggleExploded: () => void;
  setFoldAngle: (val: number) => void;
  setFoldAngleAnimated: (val: number) => void;
  incrementCoin: () => void;
  addHistory: (color: string) => void;
  setRotation: (id: string, val: number) => void;
  setDriverAngle: (id: string, val: number) => void;
  markCollected: (id: string) => void;
  setMessage: (msg: string) => void;
  stepTurn: () => void;
  markJumpFinished: (id: string, turn: number) => void;
  setParam: (id: string, val: number) => void;
  reset: () => void;
  init: (state: ProblemState, params?: ParamSpec[]) => void;
};

const defaultState: ProblemState = {
  isPlaying: true,
  isExploded: false,
  foldAngle: 0,
  foldAngleAnimated: 0,
  coins: 0,
  history: [],
  rotations: {},
  collected: [],
  message: '',
  driverAngles: {},
  turnCount: 0,
  jumpFinishedTurn: {},
  isJumping: false,
  paramValues: {},
};

function cloneState(state: ProblemState): ProblemState {
  return structuredClone(state);
}

export const useProblemStore = create<ProblemStore>((set, get) => ({
  ...defaultState,
  initialState: null,

  setIsPlaying: (playing) => set({ isPlaying: playing }),

  toggleExploded: () => set((s) => ({ isExploded: !s.isExploded })),

  setFoldAngle: (val) => set({ foldAngle: val }),

  setFoldAngleAnimated: (val) => set({ foldAngleAnimated: val }),

  incrementCoin: () => set((s) => ({ coins: s.coins + 1 })),

  addHistory: (color) => set((s) => ({ history: [...s.history, color] })),

  setRotation: (id, val) =>
    set((s) => ({ rotations: { ...s.rotations, [id]: val } })),

  setDriverAngle: (id, val) =>
    set((s) => ({ driverAngles: { ...s.driverAngles, [id]: val } })),

  markCollected: (id) =>
    set((s) => ({ collected: [...s.collected, id] })),

  setMessage: (msg) => set({ message: msg }),

  stepTurn: () => {
    if (get().isJumping) return;
    set((s) => ({ turnCount: s.turnCount + 1, isJumping: true }));
    setTimeout(() => set({ isJumping: false }), JUMP_DURATION_MS);
  },

  markJumpFinished: (id, turn) =>
    set((s) =>
      s.jumpFinishedTurn[id] != null
        ? s
        : { jumpFinishedTurn: { ...s.jumpFinishedTurn, [id]: turn } },
    ),

  // Changing a parameter also resets the run state (like regenerating the
  // track in the reference demo) so racers, counters etc. restart cleanly.
  setParam: (id, val) => {
    const initial = get().initialState;
    const paramValues = { ...get().paramValues, [id]: val };
    if (initial) {
      const restored = cloneState(initial);
      set({
        ...restored,
        initialState: initial,
        paramValues,
        // Keep the rendered fold pose; the tween walks it to the restored
        // target instead of snapping.
        foldAngleAnimated: get().foldAngleAnimated,
      });
    } else {
      set({ paramValues });
    }
  },

  // Reset restores the initial run state but keeps the user's current
  // parameter values (the reference demo's Reset doesn't rebuild the track)
  // and the current animated fold pose (so reset unfolds smoothly).
  reset: () => {
    const initial = get().initialState;
    if (initial) {
      const restored = cloneState(initial);
      set({
        ...restored,
        initialState: initial,
        paramValues: get().paramValues,
        foldAngleAnimated: get().foldAngleAnimated,
      });
    }
  },

  init: (state, params) => {
    const paramValues: Record<string, number> = {};
    for (const p of params ?? []) {
      paramValues[p.id] = p.default;
    }
    const merged = { ...defaultState, ...state, paramValues };
    // Fresh problem loads start at the target pose (no tween on load).
    merged.foldAngleAnimated = merged.foldAngle;
    const snapshot = cloneState(merged);
    set({ ...cloneState(snapshot), initialState: snapshot });
  },
}));
