import { BlockState } from "@iota/sdk-wasm-nova/web";
import { Color } from "three";
import { ThemeMode } from "./enums";

// colors
export const ACCEPTED_BLOCK_COLORS: Color[] = [new Color("#0101FF"), new Color("#0000DB"), new Color("#0101AB")];
export const CONFIRMED_BLOCK_COLOR = new Color("#3CE5E1");
export const ORPHANED_BLOCK_COLOR = new Color("#C026D3");
export const DROPPED_BLOCK_COLOR = ORPHANED_BLOCK_COLOR;
export const SEARCH_RESULT_COLOR = new Color("#1EC15A");
export const HOVERED_BLOCK_COLOR = SEARCH_RESULT_COLOR;

// colors by theme
export const PENDING_BLOCK_COLOR_LIGHTMODE = new Color("#A6C3FC");
export const PENDING_BLOCK_COLOR_DARKMODE = new Color("#5C84FA");
export const FINALIZED_BLOCK_COLOR_LIGHTMODE = new Color("#5C84FA");
export const FINALIZED_BLOCK_COLOR_DARKMODE = new Color("#000081");

export const THEME_BLOCK_COLORS: Record<ThemeMode, Record<BlockState, Color | Color[]>> = {
    [ThemeMode.Dark]: {
        accepted: ACCEPTED_BLOCK_COLORS,
        pending: PENDING_BLOCK_COLOR_DARKMODE,
        confirmed: CONFIRMED_BLOCK_COLOR,
        finalized: FINALIZED_BLOCK_COLOR_DARKMODE,
        dropped: DROPPED_BLOCK_COLOR,
        orphaned: ORPHANED_BLOCK_COLOR,
    },
    [ThemeMode.Light]: {
        accepted: ACCEPTED_BLOCK_COLORS,
        pending: PENDING_BLOCK_COLOR_LIGHTMODE,
        confirmed: CONFIRMED_BLOCK_COLOR,
        finalized: FINALIZED_BLOCK_COLOR_LIGHTMODE,
        dropped: DROPPED_BLOCK_COLOR,
        orphaned: ORPHANED_BLOCK_COLOR,
    },
};

// time
export const MILLISECONDS_PER_SECOND = 1000;

export const VISUALIZER_BACKGROUND: Record<ThemeMode, string> = {
    [ThemeMode.Dark]: "#000000",
    [ThemeMode.Light]: "#FFFFFF",
};

export const features = {
    statsEnabled: false,
    cameraControls: true,
    controlsVisualiserEnabled: true,
    showEdgeRenderingCheckbox: false,
};
