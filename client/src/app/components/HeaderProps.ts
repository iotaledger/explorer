import * as H from "history";
import { ReactNode } from "react";
import { INetwork } from "./../../models/db/INetwork";

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

    network?: INetwork;
    networks?: INetwork[];
    history?: H.History;
    action?: string;

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
