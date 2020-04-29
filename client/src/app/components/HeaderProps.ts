import { ReactNode } from "react";
import { IClientNetworkConfiguration } from "../../models/config/IClientNetworkConfiguration";

/**
 * The props for the Header component.
 */
export interface HeaderProps {
    /**
     * The current network.
     */
    networkConfig: IClientNetworkConfiguration;

    /**
     * The switch elements to display as content.
     */
    switcher?: ReactNode;

    /**
     * The search elements to display as content.
     */
    search?: ReactNode;
}
