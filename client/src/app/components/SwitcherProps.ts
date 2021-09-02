/**
 * The props for the Switcher component.
 */
export interface SwitcherProps {
    /**
     * The items to link to.
     */
    groups: {
        /**
         * The label for the group.
         */
        label: string;
        /**
         * The description of the group.
         */
        description: string;
        /**
         * The items to link to.
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
            /**
             * The description of the item.
             */
            description?: string;
            /**
             * The icon of the item.
             */
            icon?: "mainnet" | "devnet";
        }[];
    }[];

    /**
     * Is a dropdown menu.
     */
    isDropdown?: boolean;

    /**
     * The active value.
     */
    value?: string;

    /**
     * Label in case of dropdown menu.
     */
    label?: string;

    /**
     * Eyebrow in case of dropdown menu.
     */
    eyebrow?: string;
    
    /**
     * Is the component disabled.
     */
    disabled?: boolean;

    /**
     * The value changed.
     */
    onChange(value: string): void;
}
