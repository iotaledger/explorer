import HeroTestnetLight from "~/assets/background/hero-testnet-light.png";
import HeroTestnetDark from "~/assets/background/hero-testnet-dark.png";
import { ThemeMode } from "~/features/visualizer-threejs/enums";

export const HERO_BACKGROUNDS: Record<ThemeMode, string> = {
    [ThemeMode.Light]: HeroTestnetLight,
    [ThemeMode.Dark]: HeroTestnetDark,
};
