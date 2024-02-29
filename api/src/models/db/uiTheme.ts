export const IOTA_UI = "iota_ui";
export const IOTA2_UI = "iota2_ui";
export const SHIMMER_UI = "shimmer_ui";

const themes = [IOTA_UI, IOTA2_UI, SHIMMER_UI] as const;

export type Theme = (typeof themes)[number];
