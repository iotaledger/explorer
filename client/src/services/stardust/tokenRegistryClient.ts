import { FetchHelper } from "../../helpers/fetchHelper";

interface IWhitelistedResponse {
    success: boolean;
}

/**
 * Class to handle requests to Token registry.
 */
export class TokenRegistryClient {
    private readonly _endpoint: string;

    constructor(endpoint: string) {
        this._endpoint = endpoint;
    }

    public async checkNft(network: string, id: string): Promise<boolean> {
        const checkNftPath = `api/network/${network}/nfts/${id}`;
        let response;

        try {
            response = await FetchHelper.json<unknown, IWhitelistedResponse>(
                this._endpoint,
                checkNftPath,
                "get"
            );
        } catch (e) {
            console.log("Failed to check token registry", e);
        }

        return response?.success ?? false;
    }
}

