import { NetworkType } from "./networkType";
import { ProtocolVersion } from "./protocolVersion";
import { Theme } from "./uiTheme";

/**
 * Definition of network configuration.
 */
export interface INetwork {
    /**
     * The network.
     */
    network: NetworkType;

    /**
     * The protocol version.
     */
    protocolVersion: ProtocolVersion;

    /**
     * The label.
     */
    label: string;

    /**
     * The description for the network.
     */
    description?: string;

    /**
     * The provider to use for IOTA communication.
     */
    provider?: string;

    /**
     * The username for the endpoint.
     */
    user?: string;

    /**
     * The password for the endpoint.
     */
    password?: string;

    /**
     * Depth for attaches.
     */
    depth?: number;

    /**
     * Minimum weight magnitude for attaches.
     */
    mwm?: number;

    /**
     * The permanode endpoint.
     */
    permaNodeEndpoint?: string;

    /**
     * The permanode endpoint user.
     */
    permaNodeEndpointUser?: string;

    /**
     * The permanode endpoint password.
     */
    permaNodeEndpointPassword?: string;

    /**
     * The permanode endpoint JWT.
     */
    permaNodeJwt?: string;

    /**
     * The potocol used by the influxDB endpoint.
     */
    analyticsInfluxDbProtocol?: "http" | "https";

    /**
     * The analytics influxDB endpoint.
     */
    analyticsInfluxDbEndpoint?: string;

    /**
     * The analytics influxDB database name.
     */
    analyticsInfluxDbDatabase?: string;

    /**
     * The analytics influxDB username.
     */
    analyticsInfluxDbUsername?: string;

    /**
     * The analytics influxDB password.
     */
    analyticsInfluxDbPassword?: string;

    /**
     * The feed to communicate with.
     */
    feedEndpoint?: string;

    /**
     * Url endpoint for token registry.
     */
    tokenRegistryEndpoint?: string;

    /**
     * The address of the coordinator.
     */
    coordinatorAddress?: string;

    /**
     * The level of the coordinator security.
     */
    coordinatorSecurityLevel?: number;

    /**
     * The bech32 human readable part prefix.
     */
    bechHrp?: string;

    /**
     * Is the network enabled.
     */
    isEnabled: boolean;

    /**
     * Is the network enabled.
     */
    isHidden?: boolean;

    /**
     * Show the market figures.
     */
    showMarket?: boolean;

    /**
     * Set the UI theme.
     */
    uiTheme?: Theme;

    /**
     * An example for an Identity DID address.
     */
    didExample?: string;

    /**
     * Url for faucet.
     */
    faucet?: string;

    /**
     * Targeted interval in seconds between milestones.
     */
    milestoneInterval?: number;

    /**
     * Native token circulating supply.
     */
    circulatingSupply?: number;

    /**
     * Is API calls fallback disabled.
     * If both permanode and node are configured, and this is true, API calls will only try calling permanode
     * without falling back on node on failure.
     */
    disableApiFallback?: boolean;

    /**
     * If Identity Resolver tool should be supported.
     */
    identityResolverEnabled?: boolean;
}
