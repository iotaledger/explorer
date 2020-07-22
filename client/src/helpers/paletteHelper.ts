import { IPalette } from "../models/config/IPalette";

/**
 * Methods to set the global palette.
 */
export class PaletteHelper {
    /**
     * Set the global palette.
     * @param palette The palette to set.
     */
    public static setPalette(palette: IPalette): void {
        const root = window.document.querySelector("#root") as HTMLElement;
        if (root) {
            root.style.setProperty("--context-primary", palette.primary);
            root.style.setProperty("--context-secondary", palette.secondary);
        }
    }
}
