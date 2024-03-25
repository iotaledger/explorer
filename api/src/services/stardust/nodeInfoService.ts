import { INodeInfoBaseToken, IRent, Client } from "@iota/sdk";
import { StardustApiService } from "./stardustApiService";
import { NodeInfoError } from "../../errors/nodeInfoError";
import { ServiceFactory } from "../../factories/serviceFactory";
import logger from "../../logger";
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
     * The circulating supply of the network if available.
     */
    protected _ciruclatingSupply?: number | null;

    /**
     * Create a new instance of NodeInfoService.
     * @param network The network config.
     * @param nodeInfo The fetched node info.
     * @param circulatingSupply The circulating supply of the network.
     */
    private constructor(network: INetwork, nodeInfo: IReducedNodeInfo, circulatingSupply?: number | null) {
        this._network = network;
        this._nodeInfo = nodeInfo;
        this._ciruclatingSupply = circulatingSupply ?? null;
    }

    public get circulatingSupply() {
        return this._ciruclatingSupply;
    }

    public static async build(network: INetwork): Promise<NodeInfoService> {
        const apiClient = ServiceFactory.get<Client>(`client-${network.network}`);
        const stardustApiService = ServiceFactory.get<StardustApiService>(`api-service-${network.network}`);
        let nodeInfo: IReducedNodeInfo;
        let circulatingSupply: number | null = null;

        try {
            const response = await apiClient.getInfo();
            nodeInfo = {
                baseToken: response.nodeInfo.baseToken,
                protocolVersion: response.nodeInfo.protocol.version,
                bech32Hrp: response.nodeInfo.protocol.bech32Hrp,
                rentStructure: response.nodeInfo.protocol.rentStructure,
            };
        } catch (err) {
            throw new NodeInfoError(`Failed to fetch node info for "${network.network}" with error:\n${err}`);
        }

        try {
            const circulatingSupplyInBaseToken = await stardustApiService.circulatingSupply();
            if (circulatingSupplyInBaseToken) {
                // The circulating supply from inx-supply-tracker is returned in base token,
                // so we format it to subunit
                circulatingSupply = circulatingSupplyInBaseToken * Math.pow(10, nodeInfo.baseToken.decimals);
                logger.debug(`[NodeInfoService] Circulating supply for ${network.network} (in subunit): ${circulatingSupply}`);
            }
        } catch {
            logger.debug(`[NodeInfoService] Failed fetching circulating supply for ${network.network}`);
        }

        return new NodeInfoService(network, nodeInfo, circulatingSupply);
    }

    public getNodeInfo(): IReducedNodeInfo {
        return this._nodeInfo;
    }
}
