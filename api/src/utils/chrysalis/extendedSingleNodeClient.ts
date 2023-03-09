// Remove when supported by SingleNodeClient
import { SingleNodeClient } from "@iota/iota.js-chrysalis";
import { ITransactionsDetailsRequest } from "../../models/api/chrysalis/ITransactionsDetailsRequest";
import { ITransactionsDetailsResponse } from "../../models/api/chrysalis/ITransactionsDetailsResponse";
import { FetchHelper } from "../fetchHelper";

export class ExtendedSingleNodeClient extends SingleNodeClient {
    public async transactionHistory(request: ITransactionsDetailsRequest): Promise<ITransactionsDetailsResponse> {
        try {
            // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
            const { network, address, ...params } = request;

            const res = await
                this.fetchJson<never, ITransactionsDetailsResponse>("get",
                    `transactions/ed25519/${address}${params ? `${FetchHelper.urlParams(params)}` : ""}`);
            return res;
        } catch (e) {
            return { error: e };
        }
    }
}
