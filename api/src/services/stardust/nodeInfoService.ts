import { INodeInfoBaseToken, IRent, Client } from "@iota/sdk";
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
     * The protocol version running on the node.
     */
    protocolVersion: number;
    /**
     * The bech32 human readable part used in the network.
     */
    bech32Hrp: string;
    /**
     * The rent structure of the network.
     */
    rentStructure: IRent;
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
        const apiClient = new Client({ nodes: [endpoint] });
        apiClient.getInfo().then(response => {
            this._nodeInfo = {
                baseToken: response.nodeInfo.baseToken,
                protocolVersion: response.nodeInfo.protocol.version,
                bech32Hrp: response.nodeInfo.protocol.bech32Hrp,
                rentStructure: response.nodeInfo.protocol.rentStructure
            };
        }).catch(err => {
            throw new NodeInfoError(`Failed to fetch node info for "${this._network.network}" with error:\n${err}`);
        });
    }
}
