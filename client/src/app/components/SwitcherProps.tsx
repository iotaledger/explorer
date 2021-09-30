
/**
 * The props for the Switcher component.
 */
export interface SwitcherProps {
    /**
     * The label.
     */
    label?: string;

    /**
     * Is the switcher active.
     */
    checked?: boolean;

    /**
     * What to do when switcher is clicked.
     */
    onToggle(e: React.ChangeEvent<HTMLInputElement>): void;
}
