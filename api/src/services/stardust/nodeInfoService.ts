import { INodeInfoBaseToken, SingleNodeClient } from "@iota/iota.js-stardust";
import { NodeInfoError } from "../../errors/nodeInfoError";
import { INetwork } from "../../models/db/INetwork";

/**
 * The reduced node info fields relevant for Explorer.
 */
interface IReducedNodeInfo {
    /**
     * The base token info of the node.
     */
    baseToken: INodeInfoBaseToken;
    /**
     * The protocol version.
     */
    protocolVersion: number;
    /**
     * The version of node.
     */
    bech32Hrp: string;
}

/**
 * Class to handle Stardust protocol node info.
 */
export class NodeInfoService {
    /**
     * The network configuration.
     */
    protected readonly _network: INetwork;

    /**
     * The node and token info.
     */
    protected _nodeInfo: IReducedNodeInfo;

    /**
     * Create a new instance of NodeInfoService.
     * @param network The network config.
     */
    constructor(network: INetwork) {
        this._network = network;
        this.init();
    }

    public getNodeInfo(): IReducedNodeInfo {
        return this._nodeInfo;
    }

    public init(): void {
        const endpoint = this._network.provider;
        const apiClient = new SingleNodeClient(endpoint);
        apiClient.info().then(nodeInfo => {
            this._nodeInfo = {
                baseToken: nodeInfo.baseToken,
                protocolVersion: nodeInfo.protocol.version,
                bech32Hrp: nodeInfo.protocol.bech32Hrp
            };
        }).catch(err => {
            throw new NodeInfoError(`Failed to fetch node info for "${this._network.network}" with error:\n${err}`);
        });
    }
}
