/**
 * The props for the Switcher component.
 */
export interface SwitcherProps {
    /**
     * The networks to link to.
     */
    items: {
        /**
         * The label for the item.
         */
        label: string;
        /**
         * The value to select.
         */
        value: string;
    }[];

    /**
     * The active value.
     */
    value: string;

    /**
     * Is the component disabled.
     */
    disabled?: boolean;

    /**
     * The value changed.
     */
    onChange(value: string): void;
}
