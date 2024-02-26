import { BlockState } from "@iota/sdk-wasm-nova/web";
import { Color } from "three";
import { ThemeMode } from "./enums";

// steps
export const BLOCK_STEP_PX = 10;
export const STEP_CAMERA_SHIFT_PX = 100;

export const MAX_BLOCK_INSTANCES = 5000;

// nodes
export const NODE_SIZE_DEFAULT = 10;
export const NODE_SIZE_INCREMENT = 3;

// zoom
export const ZOOM_DEFAULT = 2;

// timers
export const TIME_DIFF_COUNTER = 250;
export const SECOND = 1000;
export const DATA_SENDER_TIME_INTERVAL = 500;

// colors
export const PENDING_BLOCK_COLOR = new Color("#A6C3FC");
export const ACCEPTED_BLOCK_COLOR = new Color("#0101AB");
export const CONFIRMED_BLOCK_COLOR = new Color("#0000DB");
export const FINALIZED_BLOCK_COLOR = new Color("#0101FF");

export const BLOCK_STATE_TO_COLOR = new Map<BlockState, Color>([
    ["pending", PENDING_BLOCK_COLOR],
    ["accepted", ACCEPTED_BLOCK_COLOR],
    ["confirmed", CONFIRMED_BLOCK_COLOR],
    ["finalized", FINALIZED_BLOCK_COLOR],
]);

// emitter
export const EMITTER_SPEED_MULTIPLIER = 150;
export const EMITTER_PADDING_RIGHT = 150;
export const VISUALIZER_SAFE_ZONE = 150;

// camera
export const CAMERA_X_AXIS_MOVEMENT = 0.005;
export const CAMERA_Y_AXIS_MOVEMENT = 0.065;
export const CAMERA_X_OFFSET = 0;
export const CAMERA_Y_OFFSET = 0.5;

export const FAR_PLANE = 15000;
export const NEAR_PLANE = 1;

export const VISUALIZER_PADDINGS = {
    paddingLeft: VISUALIZER_SAFE_ZONE,
    paddingRight: VISUALIZER_SAFE_ZONE,
    paddingBottom: VISUALIZER_SAFE_ZONE,
    paddingTop: VISUALIZER_SAFE_ZONE,
};

// time
export const MILLISECONDS_PER_SECOND = 1000;

// visualizer
export const DIRECTIONAL_LIGHT_INTENSITY = 0.45;

export const VISUALIZER_BACKGROUND: Record<ThemeMode, string> = {
    [ThemeMode.Dark]: "#000000",
    [ThemeMode.Light]: "#f2f2f2",
};

// emitter
export const EMITTER_WIDTH = 30;
export const EMITTER_HEIGHT = 250;
export const EMITTER_DEPTH = 250;

// conic emitter
export const MIN_TANGLE_RADIUS = 200;
export const MAX_TANGLE_RADIUS = 600;

export const MIN_BLOCKS_PER_SECOND = 150;
export const MAX_BLOCKS_PER_SECOND = 250;

export const MIN_BLOCK_NEAR_RADIUS = 20;

export const MAX_POINT_RETRIES = 10;
export const MAX_PREV_POINTS = 20;

export const SPRAY_DISTANCE = 400;
export const SPRAY_ANIMATION_DURATION = SPRAY_DISTANCE / EMITTER_SPEED_MULTIPLIER;

/* Values for randomizing the tangle */
export const NUMBER_OF_RANDOM_PERIODS = 100;
export const MIN_SINUSOID_PERIOD = 5;
export const MAX_SINUSOID_PERIOD = 8;

export const NUMBER_OF_RANDOM_AMPLITUDES = 100;
export const MIN_SINUSOID_AMPLITUDE = 100;
export const MAX_SINUSOID_AMPLITUDE = 200;

export const NUMBER_OF_RANDOM_TILTINGS = 100;
export const TILT_DURATION_SECONDS = 4;
export const MAX_TILT_FACTOR_DEGREES = 16;
export const MIN_TILT_FACTOR_DEGREES = 1;

export const features = {
    statsEnabled: false,
    cameraControls: true,
    controlsVisualiserEnabled: true,
};
