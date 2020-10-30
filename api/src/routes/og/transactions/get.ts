import { isEmpty } from "@iota/validators";
import { ServiceFactory } from "../../../factories/serviceFactory";
import { ITransactionsCursor } from "../../../models/api/og/ITransactionsCursor";
import { ITransactionsGetRequest } from "../../../models/api/og/ITransactionsGetRequest";
import { ITransactionsGetResponse } from "../../../models/api/og/ITransactionsGetResponse";
import { TransactionsGetMode } from "../../../models/api/og/transactionsGetMode";
import { IConfiguration } from "../../../models/configuration/IConfiguration";
import { NetworkService } from "../../../services/networkService";
import { TangleHelper } from "../../../utils/tangleHelper";
import { ValidationHelper } from "../../../utils/validationHelper";

/**
 * Find transactions hashes on a network.
 * @param config The configuration.
 * @param request The request.
 * @returns The response.
 */
export async function get(
    config: IConfiguration,
    request: ITransactionsGetRequest
): Promise<ITransactionsGetResponse> {
    const networkService = ServiceFactory.get<NetworkService>("network");
    const networks = (await networkService.networks()).map(n => n.network);
    ValidationHelper.oneOf(request.network, networks, "network");
    ValidationHelper.string(request.hash, "hash");

    const networkConfig = await networkService.get(request.network);

    if (networkConfig.protocolVersion !== "og") {
        return {};
    }

    if (request.limit !== undefined) {
        request.limit = Number(request.limit);
    }

    let txHashes: string[];
    let foundMode: TransactionsGetMode;
    let modes: TransactionsGetMode[];
    let txCursor: ITransactionsCursor | undefined;

    if (request.mode !== "transaction") {
        if (request.mode) {
            modes = [request.mode];
        } else if (request.hash.length <= 27) {
            modes = ["tags"];
        } else if (request.hash.length === 90) {
            modes = ["addresses"];
        } else {
            modes = ["addresses", "bundles"];
        }

        for (const mode of modes) {
            const { hashes, cursor } =
                await TangleHelper.findHashes(networkConfig, mode, request.hash, request.limit);

            if (hashes && hashes.length > 0) {
                foundMode = mode;
                txHashes = hashes;
                txCursor = cursor;
                break;
            }
        }
    }

    if ((!txHashes || txHashes.length === 0) && request.hash.length === 81) {
        const { trytes } = await TangleHelper.getTrytes(networkConfig, [request.hash]);

        if (trytes && trytes.length > 0 && !isEmpty(trytes[0])) {
            txHashes = [request.hash];
            foundMode = "transaction";
        }
    }

    return {
        mode: foundMode,
        hashes: txHashes,
        cursor: txCursor
    };
}
