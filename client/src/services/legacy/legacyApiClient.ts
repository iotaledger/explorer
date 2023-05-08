import { FetchHelper } from "../../helpers/fetchHelper";
import { ICurrenciesResponse } from "../../models/api/ICurrenciesResponse";
import { INetworkGetResponse } from "../../models/api/INetworkGetResponse";
import { IAddressGetRequest } from "../../models/api/legacy/IAddressGetRequest";
import { IAddressGetResponse } from "../../models/api/legacy/IAddressGetResponse";
import { ITransactionActionRequest } from "../../models/api/legacy/ITransactionActionRequest";
import { ITransactionActionResponse } from "../../models/api/legacy/ITransactionActionResponse";
import { ITransactionsGetRequest } from "../../models/api/legacy/ITransactionsGetRequest";
import { ITransactionsGetResponse } from "../../models/api/legacy/ITransactionsGetResponse";
import { ITrytesRetrieveRequest } from "../../models/api/legacy/ITrytesRetrieveRequest";
import { ITrytesRetrieveResponse } from "../../models/api/legacy/ITrytesRetrieveResponse";
import { IStatsGetRequest } from "../../models/api/stats/IStatsGetRequest";
import { IStatsGetResponse } from "../../models/api/stats/IStatsGetResponse";
import { ApiClient } from "../apiClient";

/**
 * Class to handle api communications on legacy.
 */
export class LegacyApiClient extends ApiClient {
    /**
     * Perform a request to get the networks.
     * @returns The response from the request.
     */
    public async networks(): Promise<INetworkGetResponse> {
        return this.callApi<unknown, INetworkGetResponse>("networks", "get");
    }

    /**
     * Perform a request to get the currency information.
     * @returns The response from the request.
     */
    public async currencies(): Promise<ICurrenciesResponse> {
        return this.callApi<unknown, ICurrenciesResponse>("currencies", "get");
    }

    /**
     * Get the stats.
     * @param request The request to send.
     * @returns The response from the request.
     */
    public async stats(request: IStatsGetRequest): Promise<IStatsGetResponse> {
        return this.callApi<unknown, IStatsGetResponse>(
            `stats/${request.network}?includeHistory=${request.includeHistory ? "true" : "false"}`,
            "get"
        );
    }

    /**
     * Find transactions from the tangle.
     * @param request The request to send.
     * @returns The response from the request.
     */
    public async transactionsGet(request: ITransactionsGetRequest): Promise<ITransactionsGetResponse> {
        const { network, hash, ...rest } = request;

        return this.callApi<unknown, ITransactionsGetResponse>(
            `transactions/${network}/${hash}/${FetchHelper.urlParams(rest)}`,
            "get"
        );
    }

    /**
     * Get trytes from the tangle.
     * @param request The request to send.
     * @returns The response from the request.
     */
    public async trytesRetrieve(request: ITrytesRetrieveRequest): Promise<ITrytesRetrieveResponse> {
        const { network, ...rest } = request;

        return this.callApi<unknown, ITransactionsGetResponse>(`trytes/${network}`, "post", rest);
    }

    /**
     * Perform tangle operation on hash.
     * @param request The request to send.
     * @returns The response from the request.
     */
    public async transactionAction(request: ITransactionActionRequest): Promise<ITransactionActionResponse> {
        return this.callApi<unknown, ITransactionActionResponse>(
            `transactions/${request.network}/${request.hash}/action/${request.action}`,
            "get"
        );
    }

    /**
     * Perform tangle operation on address.
     * @param request The request to send.
     * @returns The response from the request.
     */
    public async addressGet(request: IAddressGetRequest): Promise<IAddressGetResponse> {
        return this.callApi<unknown, IAddressGetResponse>(`address/${request.network}/${request.hash}`, "get");
    }
}
