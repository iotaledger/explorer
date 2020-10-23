
/**
 * Definition of network configuration.
 */
export interface INetwork {
    /**
     * The network.
     */
    network: string;

    /**
     * The label.
     */
    label: string;

    /**
     * The description for the network.
     */
    description: string;

    /**
     * The provider to use for IOTA communication.
     */
    provider: string;

    /**
     * Depth for attaches.
     */
    depth: number;

    /**
     * Minimum weight magnitude for attaches.
     */
    mwm: number;

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

    /**
     * The state of the network.
     */
    state: string;

    /**
     * The primary color.
     */
    primaryColor: string;

    /**
     * The secondary color.
     */
    secondaryColor: string;

    /**
     * Is the network enabled.
     */
    isEnabled: boolean;

    /**
     * Is the network enabled.
     */
    isHidden: boolean;

    /**
     * Show the market figures.
     */
    showMarket: boolean;

    /**
     * The ordering for the networks.
     */
    order: number;
}
