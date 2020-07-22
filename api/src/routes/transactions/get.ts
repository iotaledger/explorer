import { isEmpty } from "@iota/validators";
import { ITransactionsGetRequest } from "../../models/api/ITransactionsGetRequest";
import { ITransactionsGetResponse } from "../../models/api/ITransactionsGetResponse";
import { TransactionsGetMode } from "../../models/api/transactionsGetMode";
import { IConfiguration } from "../../models/configuration/IConfiguration";
import { TangleHelper } from "../../utils/tangleHelper";
import { ValidationHelper } from "../../utils/validationHelper";

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
    ValidationHelper.oneOf(request.network, config.networks.map(n => n.network), "network");
    ValidationHelper.string(request.hash, "hash");

    const networkConfig = config.networks.find(n => n.network === request.network);

    let hashes: string[];
    let foundMode: TransactionsGetMode;
    let modes: TransactionsGetMode[];
    let limitExceeded: boolean = false;
    let returnCursor: string | undefined;

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
        const { foundHashes, tooMany, cursor } = await TangleHelper.findHashes(networkConfig, mode, request.hash);

        if ((foundHashes && foundHashes.length > 0) || tooMany) {
            foundMode = mode;
            hashes = foundHashes;
            limitExceeded = tooMany;
            returnCursor = cursor;
            break;
        }
    }

    if ((!hashes || hashes.length === 0) && request.hash.length === 81) {
        const { trytes } = await TangleHelper.getTrytes(networkConfig, [request.hash]);

        if (trytes && trytes.length > 0 && !isEmpty(trytes[0])) {
            hashes = [request.hash];
            foundMode = "transaction";
        }
    }

    return {
        success: true,
        message: "OK",
        mode: foundMode,
        limitExceeded,
        hashes,
        cursor: returnCursor
    };
}
