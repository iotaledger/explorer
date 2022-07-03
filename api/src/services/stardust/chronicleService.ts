import { ITransactionHistoryRequest } from "../../models/api/stardust/ITransactionHistoryRequest";
import { ITransactionHistoryResponse } from "../../models/api/stardust/ITransactionHistoryResponse";
import { INetwork } from "../../models/db/INetwork";
import { FetchHelper } from "../../utils/fetchHelper";

export class ChronicleService {
    /**
     * The endpoint for performing communications.
     */
    private readonly _endpoint: string;

    private readonly BY_ADDRESS_API_ROUTE = "/api/history/v2/ledger/updates/by-address/";

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
                `${this.BY_ADDRESS_API_ROUTE}${request.address}${params ? `${FetchHelper.urlParams(params)}` : ""}`,
                "get"
            );
        } catch (error) {
            return { error };
        }
    }
}

