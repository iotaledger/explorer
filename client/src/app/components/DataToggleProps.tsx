
/**
 * The props for the DataToggle component.
 */
export interface DataToggleProps {

    /**
     *  The options to configure DataToggle
     */
    options: {

        /**
         * The label for the content.
         */
        label: string;

        /**
         * The content to be displayed.
         */
        content: string;

        /**
         * The link url.
         */
        link?: string;

        /**
         * Expected or not json data.
         */
        isJson?: boolean;
    }[];
}
