// TODO: remove when supported by SingleNodeClient
import { SingleNodeClient } from '@iota/iota.js';
import { ITransactionsDetailsResponse } from '../../../../deleteplease/explorer/client/src/models/api/chrysalis/ITransactionsDetailsResponse';
export class ExtendedSingleNodeClient extends SingleNodeClient {
    public async transactionHistory(address: string): Promise<ITransactionsDetailsResponse> {
        try {
            const res = await
                this.fetchJson<never, ITransactionsDetailsResponse>("get", `transactions/ed25519/${address}`);
            return res;
        } catch (e) {
            return { error: e };
        }
    }
}
