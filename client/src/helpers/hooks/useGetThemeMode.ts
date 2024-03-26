import { useEffect, useState } from "react";
import { ServiceFactory } from "~/factories/serviceFactory";
import { ThemeMode } from "~/app/lib/enums";
import { SettingsService } from "~/services/settingsService";

export function useGetThemeMode(): ThemeMode {
    const [settingsService] = useState<SettingsService>(ServiceFactory.get<SettingsService>("settings"));

    const [isDarkMode, setIsDarkMode] = useState<boolean | null>(settingsService.get().darkMode ?? null);

    const themeMode = isDarkMode ? ThemeMode.Dark : ThemeMode.Light;

    function toggleDarkMode(event: Event): void {
        const darkMode = (event as CustomEvent).detail.darkMode;
        setIsDarkMode(darkMode);
    }

    useEffect(() => {
        window.addEventListener("theme-change", toggleDarkMode);
        return () => {
            window.removeEventListener("theme-change", toggleDarkMode);
        };
    }, []);

    return themeMode;
}
