// Remove when supported by SingleNodeClient
import { SingleNodeClient } from "@iota/iota.js-chrysalis";
import { ITransactionHistoryRequest } from "../../models/api/chrysalis/ITransactionHistoryRequest";
import { ITransactionHistoryResponse } from "../../models/api/chrysalis/ITransactionHistoryResponse";
import { FetchHelper } from "../fetchHelper";

export class ExtendedSingleNodeClient extends SingleNodeClient {
    public async transactionHistory(request: ITransactionHistoryRequest): Promise<ITransactionHistoryResponse> {
        try {
            // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
            const { network, address, ...params } = request;

            const res = await
                this.fetchJson<never, ITransactionHistoryResponse>("get",
                    `addresses/ed25519/${address}/tx-history${params ? `${FetchHelper.urlParams(params)}` : ""}`);
            return res;
        } catch (e) {
            return { error: e };
        }
    }
}
