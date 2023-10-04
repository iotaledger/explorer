import { NetworkType } from "./networkType";
import { ProtocolVersion } from "./protocolVersion";
import { Theme } from "./uiTheme";

/**
 * Definition of network configuration.
 */
export interface INetwork {
    /**
     * Is the network enabled.
     */
    isEnabled: boolean;
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
     * Show the market figures.
     */
    showMarket?: boolean;
    /**
     * Set the UI theme.
     */
    uiTheme?: Theme;
    /**
     * Has stardust statistics support (influx)
     */
    hasStatisticsSupport: boolean;
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
     * If Identity Resolver tool should be supported.
     */
    identityResolverEnabled?: boolean;
    /**
     * Url endpoint for token registry.
     */
    tokenRegistryEndpoint?: string;
}
