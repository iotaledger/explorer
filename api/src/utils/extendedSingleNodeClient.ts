/* eslint-disable max-len */
/* eslint-disable no-unused-vars */
// Remove when supported by SingleNodeClient
import { SingleNodeClient } from "@iota/iota.js";
import { ITransactionsDetailsRequest } from "../models/api/chrysalis/ITransactionsDetailsRequest";
import { ITransactionsDetailsResponse } from "./../models/api/chrysalis/ITransactionsDetailsResponse";
import { FetchHelper } from "./fetchHelper";

export class ExtendedSingleNodeClient extends SingleNodeClient {
    public async transactionHistory(request: ITransactionsDetailsRequest): Promise<ITransactionsDetailsResponse> {
        try {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { network, address, ...params } = request;

            const res = await
                this.fetchJson<never, ITransactionsDetailsResponse>("get", `transactions/ed25519/${address}${params ? `${FetchHelper.urlParams(params)}` : ""}`);
            return res;
        } catch (e) {
            return { error: e };
        }
    }
}
