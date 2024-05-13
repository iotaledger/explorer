import { ThemeMode } from "../enums";

const LIGHTMODE_BACKGROUND_URL = "https://files.iota.org/media/explorer_hero_nova_light.mp4";
const DARKMODE_BACKGROUND_URL = "https://files.iota.org/media/explorer_hero_nova_dark.mp4";

export const HERO_BACKGROUNDS: Record<ThemeMode, string> = {
    [ThemeMode.Light]: LIGHTMODE_BACKGROUND_URL,
    [ThemeMode.Dark]: DARKMODE_BACKGROUND_URL,
};
