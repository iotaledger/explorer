import { NetworkType } from "../db/networkType";
import { ProtocolVersion } from "../db/protocolVersion";
import { IResponse } from "./IResponse";

export interface INetworkGetResponse extends IResponse {
    /**
     * The list of available networks.
     */
    networks?: INetworkView[];
}

interface INetworkView {
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
}

