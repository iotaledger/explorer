import { ReactNode } from "react";
import { IClientNetworkConfiguration } from "../../models/config/IClientNetworkConfiguration";

export interface LandingProps {
    /**
     * The current network.
     */
    networkConfig: IClientNetworkConfiguration;

    /**
     * Switcher component to display.
     */
    switcher: ReactNode;
}
