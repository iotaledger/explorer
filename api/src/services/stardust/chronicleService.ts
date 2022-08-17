import { IAddressBalanceResponse } from "../../models/api/stardust/IAddressBalanceResponse";
import { ITransactionHistoryRequest } from "../../models/api/stardust/ITransactionHistoryRequest";
import { ITransactionHistoryResponse } from "../../models/api/stardust/ITransactionHistoryResponse";
import { INetwork } from "../../models/db/INetwork";
import { FetchHelper } from "../../utils/fetchHelper";

export class ChronicleService {
    /**
     * The endpoint for performing communications.
     */
    private readonly _endpoint: string;

    private readonly UPDATED_BY_ADDRESS_ENDPOINT = "/api/explorer/v2/ledger/updates/by-address/";

    private readonly BALANCE_ENDPOINT = "/api/explorer/v2/balance/";

    constructor(config: INetwork) {
        this._endpoint = config.permaNodeEndpoint;
    }

    /**
     * Get the transaction history of an address.
     * @param request The ITransactionHistoryRequest.
     * @returns The history reponse.
     */
    public async transactionHistory(
        request: ITransactionHistoryRequest
    ): Promise<ITransactionHistoryResponse | undefined> {
        try {
            const params = {
                pageSize: request.pageSize,
                sort: request.sort,
                startMilestoneIndex: request.startMilestoneIndex,
                cursor: request.cursor
            };

            return await FetchHelper.json<never, ITransactionHistoryResponse>(
                this._endpoint,
                `${this.UPDATED_BY_ADDRESS_ENDPOINT}${request.address}${params ?
                    `${FetchHelper.urlParams(params)}` :
                    ""}`,
                "get"
            );
        } catch (error) {
            return { error };
        }
    }

    /**
     * Get the current address balance info.
     * @param address The address to fetch the balance for.
     * @returns The address balance response.
     */
    public async addressBalance(
        address: string
    ): Promise<IAddressBalanceResponse | undefined> {
        try {
            return await FetchHelper.json<never, IAddressBalanceResponse>(
                this._endpoint,
                `${this.BALANCE_ENDPOINT}${address}`,
                "get"
            );
        } catch (error) {
            return { error };
        }
    }
}

