
/**
 * Methods to set the global palette.
 */
export class PaletteHelper {
    /**
     * Set the global palette.
     * @param primary The primary color to set.
     * @param secondary The secondary color to set.
     */
    public static setPalette(primary: string, secondary: string): void {
        const root = window.document.querySelector("#root") as HTMLElement;
        if (root) {
            root.style.setProperty("--context-primary", primary);
            root.style.setProperty("--context-secondary", secondary);
        }
    }
}
