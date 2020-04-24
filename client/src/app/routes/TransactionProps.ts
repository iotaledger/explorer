import { IClientNetworkConfiguration } from "../../models/config/IClientNetworkConfiguration";

export interface TransactionProps {
    /**
     * The current network.
     */
    networkConfig: IClientNetworkConfiguration;

    /**
     * The hash type from the location.
     */
    hashType: string;

    /**
     * The hash from the location.
     */
    hash: string;
}
