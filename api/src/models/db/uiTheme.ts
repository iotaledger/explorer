export const IOTA_UI = "iota_ui";
export const SHIMMER_UI = "shimmer_ui";

const themes = [IOTA_UI, SHIMMER_UI] as const;

export type Theme = (typeof themes)[number];
