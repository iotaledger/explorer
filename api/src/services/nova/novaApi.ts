/* eslint-disable import/no-unresolved */
import { __ClientMethods__, OutputResponse, Client } from "@iota/sdk-nova";
import { ServiceFactory } from "../../factories/serviceFactory";
import { IAccountResponse } from "../../models/api/nova/IAccountResponse";
import { IOutputDetailsResponse } from "../../models/api/nova/IOutputDetailsResponse";
import { INetwork } from "../../models/db/INetwork";

type NameType<T> = T extends { name: infer U } ? U : never;
type ExtractedMethodNames = NameType<__ClientMethods__>;

/**
 * Class to interact with the nova API.
 */
export class NovaApi {
    /**
     * Get the output details.
     * @param network The network to find the items on.
     * @param outputId The output id to get the details.
     * @returns The item details.
     */
    public static async outputDetails(network: INetwork, outputId: string): Promise<IOutputDetailsResponse> {
        const outputResponse = await this.tryFetchNodeThenPermanode<string, OutputResponse>(outputId, "getOutput", network);

        return outputResponse ? { output: outputResponse } : { message: "Output not found" };
    }

    /**
     * Get the account details.
     * @param network The network to find the items on.
     * @param accountId The accountId to get the details for.
     * @returns The account details.
     */
    public static async accountDetails(network: INetwork, accountId: string): Promise<IAccountResponse | undefined> {
        const aliasOutputId = await this.tryFetchNodeThenPermanode<string, string>(accountId, "accountOutputId", network);

        if (aliasOutputId) {
            const outputResponse = await this.outputDetails(network, aliasOutputId);
            return outputResponse.error ? { error: outputResponse.error } : { accountDetails: outputResponse.output };
        }

        return { message: "Alias output not found" };
    }

    /**
     * Generic helper function to try fetching from node client.
     * On failure (or not present), we try to fetch from permanode (if configured).
     * @param args The argument(s) to pass to the fetch calls.
     * @param methodName The function to call on the client.
     * @param network The network config in context.
     * @returns The results or null if call(s) failed.
     */
    public static async tryFetchNodeThenPermanode<A, R>(args: A, methodName: ExtractedMethodNames, network: INetwork): Promise<R> | null {
        const { permaNodeEndpoint, disableApiFallback } = network;
        const isFallbackEnabled = !disableApiFallback;
        const client = ServiceFactory.get<Client>(`client-${network.network}`);

        try {
            // try fetch from node
            const result: Promise<R> = client[methodName](args);
            return await result;
        } catch {}

        if (permaNodeEndpoint && isFallbackEnabled) {
            const permanodeClient = ServiceFactory.get<Client>(`permanode-client-${network.network}`);
            try {
                // try fetch from permanode (chronicle)
                const result: Promise<R> = permanodeClient[methodName](args);
                return await result;
            } catch {}
        }

        return null;
    }
}
