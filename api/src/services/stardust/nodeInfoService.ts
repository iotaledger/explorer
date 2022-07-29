import { INodeInfoBaseToken, SingleNodeClient } from "@iota/iota.js-stardust";
import { INetwork } from "../../models/db/INetwork";
import { INodeService } from "../../models/services/INodeService";

interface INodeAndTokenInfo {
    baseToken: INodeInfoBaseToken;
    protocolVersion: number;
    bech32Hrp: string;
}

const DEFAULT_NODE_INFO: INodeAndTokenInfo = {
    baseToken: {
        name: "IOTA",
        tickerSymbol: "MIOTA",
        unit: "i",
        decimals: 0,
        subunit: undefined,
        useMetricPrefix: true
    },
    protocolVersion: 2,
    bech32Hrp: "rms"
};

/**
 * Class to handle Stardust protocol node info.
 */
export class NodeInfoService implements INodeService {
    /**
     * The network configuration.
     */
    protected readonly _network: INetwork;

    /**
     * The node and token info.
     */
    protected _nodeInfo: INodeAndTokenInfo = DEFAULT_NODE_INFO;

    /**
     * Create a new instance of NodeInfoService.
     * @param network The network config.
     */
    constructor(network: INetwork) {
        this._network = network;
        this.init();
    }

    public getNodeAndTokenInfo(): INodeAndTokenInfo {
        return this._nodeInfo;
    }

    private init(): void {
        const endpoint = this._network.provider;
        const apiClient = new SingleNodeClient(endpoint);
        apiClient.info()
        .then(info => {
            this._nodeInfo = {
                baseToken: info.baseToken,
                protocolVersion: info.protocol.protocolVersion,
                bech32Hrp: info.protocol.bech32HRP
            };
            console.log("Node info", this._network.network, this._nodeInfo);
        })
        .catch(err => {
            console.log(err);
        });
    }
}
