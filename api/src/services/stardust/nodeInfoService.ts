import { INodeInfoBaseToken, IRent, Client } from "@iota/sdk";
import { NodeInfoError } from "../../errors/nodeInfoError";
import { ServiceFactory } from "../../factories/serviceFactory";
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
     * @param nodeInfo The fetched node info
     */
    private constructor(network: INetwork, nodeInfo: IReducedNodeInfo) {
        this._network = network;
        this._nodeInfo = nodeInfo;
    }

    public static async build(network: INetwork): Promise<NodeInfoService> {
        const apiClient = ServiceFactory.get<Client>(`client-${network.network}`);

        try {
            const response = await apiClient.getInfo();
            const nodeInfo = {
                baseToken: response.nodeInfo.baseToken,
                protocolVersion: response.nodeInfo.protocol.version,
                bech32Hrp: response.nodeInfo.protocol.bech32Hrp,
                rentStructure: response.nodeInfo.protocol.rentStructure
            };

            return new NodeInfoService(network, nodeInfo);
        } catch (err) {
            throw new NodeInfoError(`Failed to fetch node info for "${network.network}" with error:\n${err}`);
        }
    }

    public getNodeInfo(): IReducedNodeInfo {
        return this._nodeInfo;
    }
}
