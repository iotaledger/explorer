/**
 * The props for the Header component.
 */
export interface HeaderDropdownProps {
    /**
     * The label for the dropdown.
     */
    label?: string;

    /**
     * The description above the title.
     */
    eyebrow?: string;

    /**
     * The columns when dropdown is expanded.
     */
    columns: {
        /**
         * The label for the page.
         */
        label: string;

        /**
         * The description for the page.
         */
        description?: string;

        items?: {

            /**
              * The label for the item.
              */
            label: string;

            /**
              * The link for the page.
              */
            url?: string;

            /**
             * The icon for the page.
             */
            icon?: string;

            /**
              * The link for the page.
              */
            onClick?(value: string): void;
        }[];
    }[];
}
