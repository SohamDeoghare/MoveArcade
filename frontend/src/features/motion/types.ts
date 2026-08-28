export interface HandPosition {
  x: number;
  y: number;
}

export interface MotionState {
  hand: HandPosition | null;
  isTracking: boolean;
}