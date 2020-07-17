import { IFoundationData } from "../../models/IFoundationData";

/**
 * The state for the Footer component.
 */
export interface FooterState {
    /**
     * Site SPecific Footer section.
     */
    siteFooterSection: {
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
        }[];
    };

    /**
     * The foundation info.
     */
    foundationData?: IFoundationData;
}
