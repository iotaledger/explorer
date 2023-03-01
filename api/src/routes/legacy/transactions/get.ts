import { isEmpty } from "@iota/validators";
import { ServiceFactory } from "../../../factories/serviceFactory";
import { ITransactionsCursor } from "../../../models/api/legacy/ITransactionsCursor";
import { ITransactionsGetRequest } from "../../../models/api/legacy/ITransactionsGetRequest";
import { ITransactionsGetResponse } from "../../../models/api/legacy/ITransactionsGetResponse";
import { TransactionsGetMode } from "../../../models/api/legacy/transactionsGetMode";
import { IConfiguration } from "../../../models/configuration/IConfiguration";
import { LEGACY } from "../../../models/db/protocolVersion";
import { NetworkService } from "../../../services/networkService";
import { ChrysalisTangleHelper } from "../../../utils/chrysalis/chrysalisTangleHelper";
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
    const networks = networkService.networkNames();
    ValidationHelper.oneOf(request.network, networks, "network");
    ValidationHelper.string(request.hash, "hash");

    const networkConfig = networkService.get(request.network);

    if (networkConfig.protocolVersion !== LEGACY) {
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
                await ChrysalisTangleHelper.findHashes(networkConfig, mode, request.hash, request.limit);

            if (hashes && hashes.length > 0) {
                foundMode = mode;
                txHashes = hashes;
                txCursor = cursor;
                break;
            }
        }
    }

    // We can't find the hash as an address, bundle etc, so see if this was a tx hash
    // but not if we were looking for approvees as we don't want to list ourselves
    if (request.mode !== "approvees" && (!txHashes || txHashes.length === 0) && request.hash.length === 81) {
        const { trytes } = await ChrysalisTangleHelper.getTrytes(networkConfig, [request.hash]);

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
