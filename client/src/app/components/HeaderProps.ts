import { ReactNode } from "react";

/**
 * The props for the Header component.
 */
export interface HeaderProps {
    /**
     * The current network.
     */
    networkId: string;

    /**
     * The switch elements to display as content.
     */
    switcher?: ReactNode;

    /**
     * The search elements to display as content.
     */
    search?: ReactNode;
}
