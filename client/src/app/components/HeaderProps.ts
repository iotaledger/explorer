import { ReactNode } from "react";

/**
 * The props for the Header component.
 */
export interface HeaderProps {
    /**
     * The root path.
     */
    rootPath: string;

    /**
     * The switch elements to display as content.
     */
    switcher?: ReactNode;

    /**
     * The search elements to display as content.
     */
    search?: ReactNode;

    /**
     * Utilities menu
     */
    utilities?: {
        /**
         * The label for the utility.
         */
        label: string;

        /**
         * The link for the utility.
         */
        url: string;
    }[];

    /**
     * Pages menu
     */
    pages?: {
        /**
         * The label for the page.
         */
        label: string;

        /**
         * The link for the page.
         */
        url: string;
    }[];
}
