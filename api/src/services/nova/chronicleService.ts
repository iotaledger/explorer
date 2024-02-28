import logger from "../../logger";
import { IAddressBalanceResponse } from "../../models/api/nova/chronicle/IAddressBalanceResponse";
import { ITransactionHistoryRequest } from "../../models/api/nova/chronicle/ITransactionHistoryRequest";
import { ITransactionHistoryResponse } from "../../models/api/nova/chronicle/ITransactionHistoryResponse";
import { INetwork } from "../../models/db/INetwork";
import { FetchHelper } from "../../utils/fetchHelper";

const CHRONICLE_ENDPOINTS = {
    updatesByAddress: "/api/explorer/v3/ledger/updates/by-address/",
    balance: "/api/explorer/v3/balance/",
};

export class ChronicleService {
    /**
     * The endpoint for performing communications.
     */
    private readonly chronicleEndpoint: string;

    /**
     * The network config in context.
     */
    private readonly networkConfig: INetwork;

    constructor(config: INetwork) {
        this.networkConfig = config;
        this.chronicleEndpoint = config.permaNodeEndpoint;
    }

    /**
     * Get the current address balance info.
     * @param address The address to fetch the balance for.
     * @returns The address balance response.
     */
    public async addressBalance(address: string): Promise<IAddressBalanceResponse | undefined> {
        try {
            return await FetchHelper.json<never, IAddressBalanceResponse>(
                this.chronicleEndpoint,
                `${CHRONICLE_ENDPOINTS.balance}${address}`,
                "get",
            );
        } catch (error) {
            const network = this.networkConfig.network;
            logger.warn(`[ChronicleService (Nova)] Failed fetching address balance for ${address} on ${network}. Cause: ${error}`);
        }
    }

    /**
     * Get the transaction history of an address.
     * @param request The ITransactionHistoryRequest.
     * @returns The history reponse.
     */
    public async transactionHistory(request: ITransactionHistoryRequest): Promise<ITransactionHistoryResponse | undefined> {
        try {
            const params = {
                pageSize: request.pageSize,
                sort: request.sort,
                startSlotIndex: request.startSlotIndex,
                cursor: request.cursor,
            };

            return await FetchHelper.json<never, ITransactionHistoryResponse>(
                this.chronicleEndpoint,
                `${CHRONICLE_ENDPOINTS.updatesByAddress}${request.address}${params ? `${FetchHelper.urlParams(params)}` : ""}`,
                "get",
            );
        } catch (error) {
            const network = this.networkConfig.network;
            logger.warn(`[ChronicleService] Failed fetching tx history for ${request.address} on ${network}. Cause: ${error}`);
        }
    }
}
