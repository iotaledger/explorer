/**
 * Definition of the foundation information.
 */
export interface IFoundation {
    /**
     * Footer sections.
     */
    footerSections: {
        /**
         * The label for the section.
         */
        label: string;

        /**
         * The items to display in the section.
         */
        items: {
            /**
             * The label for the data.
             */
            label: string;

            /**
             * The url for the data.
             */
            url: string;
        }[]
    }[];

    /**
     * The registered address details.
     */
    registeredAddress: {
        /**
         * The label for the data.
         */
        label: string;

        /**
         * The value for the data.
         */
        value: string[];
    };

    /**
     * The registered address details.
     */
    visitingAddress: {
        /**
         * The label for the data.
         */
        label: string;

        /**
         * The value for the data.
         */
        value: string[];
    };

    /**
     * The information fields.
     */
    information: {
        /**
         * The label for the data.
         */
        label: string;

        /**
         * The value for the data.
         */
        value?: string | string[];

        /**
         * The url for the data.
         */
        url?: string;
    }[];
}
