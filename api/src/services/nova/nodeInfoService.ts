/* eslint-disable import/no-unresolved */
import { Client, INodeInfo } from "@iota/sdk-nova";
import { NodeInfoError } from "../../errors/nodeInfoError";
import { ServiceFactory } from "../../factories/serviceFactory";
import { INetwork } from "../../models/db/INetwork";

/**
 * Class to handle Nova protocol node info.
 */
export class NodeInfoService {
    /**
     * The network configuration.
     */
    protected readonly _network: INetwork;

    /**
     * The node and token info.
     */
    protected _nodeInfo: INodeInfo;

    /**
     * Create a new instance of NodeInfoService.
     * @param network The network config.
     * @param nodeInfo The fetched node info
     */
    private constructor(network: INetwork, nodeInfo: INodeInfo) {
        this._network = network;
        this._nodeInfo = nodeInfo;
    }

    public static async build(network: INetwork): Promise<NodeInfoService> {
        const apiClient = ServiceFactory.get<Client>(`client-${network.network}`);

        try {
            const response = await apiClient.getInfo();
            return new NodeInfoService(network, response.nodeInfo);
        } catch (err) {
            throw new NodeInfoError(`Failed to fetch node info for "${network.network}" with error:\n${err}`);
        }
    }

    public getNodeInfo(): INodeInfo {
        return this._nodeInfo;
    }
}
