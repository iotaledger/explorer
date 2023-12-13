import { Color } from "three";

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

export const EMITTER_WIDTH = 30;
export const EMITTER_HEIGHT = 250;
export const EMITTER_DEPTH = 250;
