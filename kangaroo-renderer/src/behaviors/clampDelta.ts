/**
 * Under `frameloop="demand"` the scene can sit idle for seconds, so the
 * FIRST frame of any animation sees a `delta` equal to the whole idle gap —
 * advancing progress-based animations to completion in one frame (looks
 * like teleporting). Clamp delta to a sane per-frame maximum so animations
 * always play out frame by frame.
 */
export function clampDelta(delta: number): number {
  return Math.min(delta, 1 / 30);
}
