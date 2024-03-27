import { INodeInfoBaseToken, IRent, Client } from "@iota/sdk-stardust";
import cron from "node-cron";
import { StardustApiService } from "./stardustApiService";
import { NodeInfoError } from "../../errors/nodeInfoError";
import { ServiceFactory } from "../../factories/serviceFactory";
import logger from "../../logger";
import { INetwork } from "../../models/db/INetwork";

// The cron interval value to update the circulating supply every 10 minutes.
const CIRCULATING_SUPPLY_UPDATE_INTERVAL = "*/10 * * * *";

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
     */
    private constructor(network: INetwork, nodeInfo: IReducedNodeInfo) {
        this._network = network;
        this._nodeInfo = nodeInfo;

        this.setupCirculatingSupplyUpdater();
    }

    public get circulatingSupply() {
        return this._ciruclatingSupply;
    }

    public static async build(network: INetwork): Promise<NodeInfoService> {
        const apiClient = ServiceFactory.get<Client>(`client-${network.network}`);

        try {
            const response = await apiClient.getInfo();
            const nodeInfo = {
                baseToken: response.nodeInfo.baseToken,
                protocolVersion: response.nodeInfo.protocol.version,
                bech32Hrp: response.nodeInfo.protocol.bech32Hrp,
                rentStructure: response.nodeInfo.protocol.rentStructure,
            };

            return new NodeInfoService(network, nodeInfo);
        } catch (err) {
            throw new NodeInfoError(`Failed to fetch node info for "${network.network}" with error:\n${err}`);
        }
    }

    public getNodeInfo(): IReducedNodeInfo {
        return this._nodeInfo;
    }

    private setupCirculatingSupplyUpdater() {
        // eslint-disable-next-line no-void
        void this.updateCirculatingSupply();

        cron.schedule(CIRCULATING_SUPPLY_UPDATE_INTERVAL, async () => {
            await this.updateCirculatingSupply();
        });
    }

    private async updateCirculatingSupply() {
        const stardustApiService = ServiceFactory.get<StardustApiService>(`api-service-${this._network.network}`);
        let circulatingSupply: number | null = null;

        try {
            const circulatingSupplyInBaseToken = await stardustApiService.circulatingSupply();
            if (circulatingSupplyInBaseToken) {
                // The circulating supply from inx-supply-tracker is returned in base token,
                // so we format it to subunit
                circulatingSupply = circulatingSupplyInBaseToken * Math.pow(10, this._nodeInfo.baseToken.decimals);
                logger.debug(`[NodeInfoService] Circulating supply for ${this._network.network} (in subunit): ${circulatingSupply}`);

                this._ciruclatingSupply = circulatingSupply;
            }
        } catch {
            logger.debug(`[NodeInfoService] Failed fetching circulating supply for ${this._network.network}`);
        }
    }
}
