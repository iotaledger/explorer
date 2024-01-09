import { Color } from "three";
import { ThemeMode } from './enums';

// steps
export const STEP_Y_PX = 20;
export const STEP_CAMERA_SHIFT_PX = 100;

export const MAX_BLOCK_INSTANCES = 5000;

// nodes
export const NODE_SIZE_DEFAULT = 5;
export const NODE_SIZE_INCREMENT = 3;

// zoom
export const ZOOM_DEFAULT = 2;

// timers
export const TIME_DIFF_COUNTER = 250;
export const SECOND = 1000;
export const DATA_SENDER_TIME_INTERVAL = 500;
export const ANIMATION_TIME_SECONDS = 3;

// colors
export const PENDING_BLOCK_COLOR = new Color('#A6C3FC')

export const ACCEPTED_BLOCK_COLORS = [
  new Color('#0101FF'),
  new Color('#0000DB'),
  new Color('#0101AB'),
]

export const COLORS = [
  new Color('#F0F4FF'),
  new Color('#E0EAFF'),
  new Color('#C8DAFE'),
  PENDING_BLOCK_COLOR,
  new Color('#82A5F8'),
  new Color('#5C84FA'),
  new Color('#2559F5'),
  ...ACCEPTED_BLOCK_COLORS,
]

// emitter
export const EMITTER_SPEED_MULTIPLIER = 80
export const EMITTER_PADDING_RIGHT = 150
export const VISUALIZER_SAFE_ZONE = 150

// camera
export const CAMERA_X_AXIS_MOVEMENT = 0.025
export const CAMERA_Y_AXIS_MOVEMENT = 0.035
export const CAMERA_X_OFFSET = 0
export const CAMERA_Y_OFFSET = 0.5

export const FAR_PLANE = 15000
export const NEAR_PLANE = 1

export const VISUALIZER_PADDINGS = {
  paddingLeft: VISUALIZER_SAFE_ZONE,
  paddingRight: VISUALIZER_SAFE_ZONE,
  paddingBottom: VISUALIZER_SAFE_ZONE,
  paddingTop: VISUALIZER_SAFE_ZONE,
}

// general
export const MIN_BLOCKS_PER_SECOND = 50
export const MAX_BLOCKS_PER_SECOND = 200

// time
export const MILLISECONDS_PER_SECOND = 1000

// visualizer
export const DIRECTIONAL_LIGHT_INTENSITY = 0.45;

export const VISUALIZER_BACKGROUND: Record<ThemeMode, string> = {
  [ThemeMode.Dark]: "#000000",
  [ThemeMode.Light]: "#f2f2f2",
}

// emitter
export const EMITTER_WIDTH = 30;
export const EMITTER_HEIGHT = 250;
export const EMITTER_DEPTH = 250;

export const MAX_AMPLITUDE = 200;
export const AMPLITUDE_ACCUMULATOR = 10;
export const HALF_WAVE_PERIOD_SECONDS = 4;
