/**
 * The props for the Footer component.
 */
export interface FooterProps {
    /**
     * The dynamic sections to link to.
     */
    dynamic: {
        /**
         * The label for the network.
         */
        label: string;
        /**
         * The url to navigate to.
         */
        url: string;
    }[];
}
