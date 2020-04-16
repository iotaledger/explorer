import { composeAPI } from "@iota/core";
import { asTransactionTrytes } from "@iota/transaction-converter";
import { ChronicleClient } from "../../clients/chronicleClient";
import { ConfirmationState } from "../../models/api/confirmationState";
import { IGetTrytesRequest } from "../../models/api/IGetTrytesRequest";
import { IGetTrytesResponse } from "../../models/api/IGetTrytesResponse";
import { IConfiguration } from "../../models/configuration/IConfiguration";
import { ValidationHelper } from "../../utils/validationHelper";

/**
 * Get transactions for the requested hashes.
 * @param config The configuration.
 * @param request The request.
 * @returns The response.
 */
export async function getTrytes(config: IConfiguration, request: IGetTrytesRequest)
    : Promise<IGetTrytesResponse> {

    const allTrytes: {
        /**
         * The original index.
         */
        index: number;
        /**
         * The hash.
         */
        hash: string,
        /**
         * The trytes.
         */
        trytes?: string,
        /**
         * The confirmations.
         */
        confirmation?: ConfirmationState
    }[] = request.hashes.map((h, idx) => ({ index: idx, hash: h }));

    ValidationHelper.oneOf(request.network, config.networks.map(n => n.network), "network");
    const networkConfig = config.networks.find(n => n.network === request.network);

    try {
        const api = composeAPI({
            provider: networkConfig.node.provider
        });

        const response = await api.getTrytes(allTrytes.map(a => a.hash));

        if (response) {
            for (let i = 0; i < response.length; i++) {
                allTrytes[i].trytes = response[i];
            }

            const nodeInfo = await api.getNodeInfo();
            const tips = [];
            if (nodeInfo) {
                tips.push(nodeInfo.latestSolidSubtangleMilestone);
            }

            const statesResponse = await api.getInclusionStates(request.hashes, tips);

            if (statesResponse) {
                for (let i = 0; i < statesResponse.length; i++) {
                    allTrytes[i].confirmation = statesResponse[i] ? "confirmed" : "pending";
                }
            }
        }
    } catch (err) {
        console.error(`${request.network} Error`, err);
    }

    const missing = allTrytes.filter(a => !a.trytes || /^[9]+$/.test(a.trytes));

    if (missing.length > 0 &&
        networkConfig.permaNodeEndpoint) {
        try {
            const chronicleClient = new ChronicleClient(networkConfig.permaNodeEndpoint);
            const response = await chronicleClient.getTrytes({ hashes: missing.map(mh => mh.hash) });

            if (response && response.trytes) {
                for (let i = 0; i < missing.length; i++) {
                    missing[i].trytes = asTransactionTrytes({
                        hash: missing[i].hash,
                        ...response.trytes[i]
                    });

                    missing[i].confirmation = response.trytes[i].snapshotIndex ? "confirmed" : "pending";
                }
            }
        } catch (err) {
            console.error("Chronicle Error", err);
        }
    }

    return {
        success: true,
        message: "OK",
        trytes: allTrytes.map(t => t.trytes || "9".repeat(2673)),
        confirmationStates: allTrytes.map(t => t.confirmation || "unknown")
    };
}
