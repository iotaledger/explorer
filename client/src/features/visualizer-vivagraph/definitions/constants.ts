import { BlockState } from "@iota/sdk-wasm-nova/web";
import { ThemeMode } from "./enums";

export const MAX_VISIBLE_BLOCKS = 2500;

// colors
export const ACCEPTED_BLOCK_COLORS: string[] = ["#0101FF", "#0000DB", "#0101AB"];
export const CONFIRMED_BLOCK_COLOR = "#3CE5E1";
export const ORPHANED_BLOCK_COLOR = "#C026D3";
export const DROPPED_BLOCK_COLOR = ORPHANED_BLOCK_COLOR;
export const SEARCH_RESULT_COLOR = "#1EC15A";
export const HOVERED_BLOCK_COLOR = SEARCH_RESULT_COLOR;
export const EDGE_COLOR_CONFIRMING_HEX: number = '#5aaaff';
export const EDGE_COLOR_CONFIRMING: number = 0xff5aaaff;
export const EDGE_COLOR_CONFIRMED_BY: number = 0x0000ffff;


// colors by theme
export const PENDING_BLOCK_COLOR_LIGHTMODE = "#A6C3FC";
export const PENDING_BLOCK_COLOR_DARKMODE = "#5C84FA";
export const FINALIZED_BLOCK_COLOR_LIGHTMODE = "#5C84FA";
export const FINALIZED_BLOCK_COLOR_DARKMODE = "#000081";

export const THEME_BLOCK_COLORS: Record<ThemeMode, Record<BlockState, string | string[]>> = {
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
