import { IClientNetworkConfiguration } from "../models/config/IClientNetworkConfiguration";

export interface AppState {
    /**
     * The current active network.
     */
    networkConfig: IClientNetworkConfiguration;
}
