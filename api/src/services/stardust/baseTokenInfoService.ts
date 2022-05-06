import { INodeInfoBaseToken, SingleNodeClient } from "@iota/iota.js-stardust";
import { INetwork } from "../../models/db/INetwork";
import { IBaseTokenService } from "../../models/services/IBaseTokenService";

/**
 * Class to handle Stardust protocol base token info.
 */
export class BaseTokenInfoService implements IBaseTokenService {
    /**
     * The network configuration.
     */
    protected readonly _network: INetwork;

    /**
     * The statistics.
     */
    protected _baseTokenInfo: INodeInfoBaseToken;

    /**
     * Create a new instance of BaseTokenInfoService.
     * @param network The network config.
     */
    constructor(network: INetwork) {
        this._network = network;
        this.init();
    }

    public getBaseTokenInfo(): INodeInfoBaseToken {
        return this._baseTokenInfo;
    }

    private init(): void {
        const endpoint = this._network.provider;
        const apiClient = new SingleNodeClient(endpoint);
        apiClient.info()
        .then(info => {
            this._baseTokenInfo = info.baseToken;
            console.log("Base token info", this._network.network, this._baseTokenInfo);
        })
        .catch(err => {
            console.log(err);
        });
    }
}
