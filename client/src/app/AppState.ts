import { INetwork } from "../models/db/INetwork";

export interface AppState {
    /**
     * The current active network.
     */
    networkId: string;

    /**
     * The networks.
     */
    networks: INetwork[];

    /**
     * The current search query.
     */
    query?: string;
}
