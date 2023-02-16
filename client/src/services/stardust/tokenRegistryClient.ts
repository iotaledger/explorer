import { ServiceFactory } from "../../factories/serviceFactory";
import { FetchHelper } from "../../helpers/fetchHelper";
import { NetworkService } from "../networkService";

interface IWhitelistedResponse {
    success: boolean;
}

/**
 * Class to handle requests to Token registry.
 */
export class TokenRegistryClient {
    protected _networkService: NetworkService;


    constructor() {
        this._networkService = ServiceFactory.get<NetworkService>("network");
    }

    public async checkNft(network: string, id: string): Promise<boolean> {
        const networkConfig = this._networkService.get(network);
        const endpoint = networkConfig?.tokenRegistry;
        const checkNftPath = `api/network/${network}/nfts/${id}`;
        let response;

        if (endpoint) {
            try {
                response = await FetchHelper.json<unknown, IWhitelistedResponse>(
                    endpoint,
                    checkNftPath,
                    "get"
                );
            } catch (e) {
                console.log("Failed to check token registry", e);
            }

            return response?.success ?? false;
        }
        return true;
    }

    public async checkNativeToken(network: string, id: string): Promise<boolean> {
        const networkConfig = this._networkService.get(network);
        const endpoint = networkConfig?.tokenRegistry;
        const checkNativeTokensPath = `api/network/${network}/native-tokens/${id}`;
        let response;

        if (endpoint) {
            try {
                response = await FetchHelper.json<unknown, IWhitelistedResponse>(
                    endpoint,
                    checkNativeTokensPath,
                    "get"
                );
            } catch (e) {
                console.log("Failed to check token registry", e);
            }
            return response?.success ?? false;
        }
        return true;
    }
}

