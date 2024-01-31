import { ServiceFactory } from "~factories/serviceFactory";
import { FetchHelper } from "~helpers/fetchHelper";
import { NetworkService } from "../networkService";

interface IWhitelistedResponse {
    success: boolean;
}

const BASE_PATH = "/api/network/";
const NFTS_PATH = "/nfts/";
const NATIVE_TOKENS_PATH = "/native-tokens/";

/**
 * Class to handle requests to Token registry.
 */
export class TokenRegistryClient {
    private readonly _networkService: NetworkService;

    constructor() {
        this._networkService = ServiceFactory.get<NetworkService>("network");
    }

    public async checkNft(network: string, id: string): Promise<boolean> {
        const networkConfig = this._networkService.get(network);
        const endpoint = networkConfig?.tokenRegistryEndpoint;

        if (!endpoint) {
            // no token registry is configured, means everything is "whitelisted"
            return true;
        }

        let response;
        try {
            response = await FetchHelper.json<unknown, IWhitelistedResponse>(endpoint, `${BASE_PATH}${network}${NFTS_PATH}${id}`, "get");
        } catch (e) {
            console.error("Failed to check token registry", e);
        }

        return response?.success ?? false;
    }

    public async checkNativeToken(network: string, id: string): Promise<boolean> {
        const networkConfig = this._networkService.get(network);
        const endpoint = networkConfig?.tokenRegistryEndpoint;

        if (!endpoint) {
            // no token registry is configured, means everything is "whitelisted"
            return true;
        }

        let response;
        try {
            response = await FetchHelper.json<unknown, IWhitelistedResponse>(
                endpoint,
                `${BASE_PATH}${network}${NATIVE_TOKENS_PATH}${id}`,
                "get",
            );
        } catch (e) {
            console.error("Failed to check token registry", e);
        }

        return response?.success ?? false;
    }
}
