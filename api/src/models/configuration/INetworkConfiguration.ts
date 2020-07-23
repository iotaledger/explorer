
import { INodeConfiguration } from "./INodeConfiguration";

/**
 * Definition of network configuration file.
 */
export interface INetworkConfiguration {
    /**
     * The network.
     */
    network: string;

    /**
     * The label.
     */
    label: string;

    /**
     * The node to communicate with.
     */
    node: INodeConfiguration;

    /**
     * The permanode endpoint.
     */
    permaNodeEndpoint?: string;

    /**
     * The zmq feed to communicate with.
     */
    zmqEndpoint?: string;

    /**
     * The address of the coordinator.
     */
    coordinatorAddress: string;

    /**
     * The level of the coordinator security.
     */
    coordinatorSecurityLevel: number;
}
