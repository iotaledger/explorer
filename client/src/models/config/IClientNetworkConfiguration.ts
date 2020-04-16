import { Network } from "../network";
import { INodeConfiguration } from "./INodeConfiguration";
import { IPalette } from "./IPalette";

/**
 * Definition of network configuration file.
 */
export interface IClientNetworkConfiguration {
    /**
     * The network.
     */
    network: Network;

    /**
     * The label.
     */
    label: string;

    /**
     * The node to communicate with.
     */
    node: INodeConfiguration;

    /**
     * The address of the coordinator.
     */
    coordinatorAddress: string;

    /**
     * Pallete for the network.
     */
    palette: IPalette;
}
