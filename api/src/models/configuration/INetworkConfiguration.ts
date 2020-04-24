
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
     * The zmq message to monitor.
     */
    zmqTransactionMessage?: "tx_trytes" | "trytes";

    /**
     * The address of the coordinator.
     */
    coordinatorAddress: string;
}
