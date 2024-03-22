/* eslint-disable import/no-unresolved */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Client, InfoResponse, ProtocolParameters } from "@iota/sdk-nova";
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
    protected _nodeInfo: InfoResponse;

    /**
     * The client to use for requests.
     */
    private readonly _client: Client;

    /**
     * Create a new instance of NodeInfoService.
     * @param network The network config.
     * @param nodeInfo The fetched node info
     * @param client The fetched node info
     */
    private constructor(network: INetwork, nodeInfo: InfoResponse, client?: Client) {
        this._network = network;
        this._nodeInfo = nodeInfo;
        this._client = client;
    }

    public static async build(network: INetwork): Promise<NodeInfoService> {
        const apiClient = ServiceFactory.get<Client>(`client-${network.network}`);

        try {
            const response = await apiClient.getNodeInfo();
            return new NodeInfoService(network, response.info, apiClient);
        } catch (err) {
            throw new NodeInfoError(`Failed to fetch node info for "${network.network}" with error:\n${err}`);
        }
    }

    public getNodeInfo(): InfoResponse {
        return this._nodeInfo;
    }

    public async getProtocolParameters(): Promise<ProtocolParameters> {
        return this._client.getProtocolParameters();
    }
}
