import logger from "../logger";
import { ILatestResponse } from "../models/clients/fixer/ILatestResponse";
import { FetchHelper } from "../utils/fetchHelper";

/**
 * Class to handle requests to fixer.io api.
 */
export class FixerClient {
    /**
     * The api key for the client.
     */
    private readonly _apiKey: string;

    /**
     * The endpoint the client.
     */
    private readonly _endpoint: string;

    /**
     * Create a new instance of FixerClient.
     * @param apiKey The api key for requests.
     */
    constructor(apiKey: string) {
        this._apiKey = apiKey;
        this._endpoint = "https://api.apilayer.com/fixer/";
    }

    /**
     * Get the latest api rates.
     * @param baseCurrency The base currency to use for the rates.
     * @returns The exchange rates.
     */
    public async latest(baseCurrency: string): Promise<ILatestResponse> {
        let response: ILatestResponse;

        try {
            response = await FetchHelper.json<unknown, ILatestResponse>(
                this._endpoint,
                `latest?base=${baseCurrency}&symbols=USD,JPY,GBP,CAD,SEK,CHF`,
                "get",
                null,
                { apiKey: this._apiKey }
            );
        } catch (e) {
            logger.error(`Failed fetching latest from fixerAPI. Cause: ${e}`);
        }

        return response;
    }
}
