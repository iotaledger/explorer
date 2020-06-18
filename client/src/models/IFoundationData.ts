export interface IFoundationData {
    /**
     * Main sites to list in header navigation.
     */
    sites: {
        /**
         * The label for the link.
         */
        label: string;
        /**
         * The url to link to.
         */
        url: string;
    }[];

    /**
     * Footer sections for global links.
     */
    footerSections: {
        /**
         * Label for the section.
         */
        label: string;

        /**
         * Items within the section.
         */
        items: {
            /**
             * The label for the link.
             */
            label: string;
            /**
             * The url to link to.
             */
            url: string;
        }[];
    }[];

    /**
     * Registered address details.
     */
    registeredAddress: {
        /**
         * The label for the address.
         */
        label: string;

        /**
         * The lines for the address.
         */
        value: string[];
    };

    /**
     * Visiting address details.
     */
    visitingAddress: {
        /**
         * The label for the address.
         */
        label: string;

        /**
         * The lines for the address.
         */
        value: string[];
    };

    /**
     * Foundation information items.
     */
    information: {
        /**
         * The label for the information.
         */
        label: string;

        /**
         * The optional value for the information.
         */
        value?: string;

        /**
         * The optional urls.
         */
        urls?: {
            /**
             * The label for the link.
             */
            label: string;
            /**
             * The url to link to.
             */
            url: string;
        }[];
    }[];
}
