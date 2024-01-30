// import JSZip from "jszip";
import {
    OutputResponse,
    // INodeInfoBaseToken,
    CommonOutput,
} from "@iota/sdk";
// import { Utils } from "@iota/sdk-wasm/web";
// Utils.
import moment from "moment";
import { ServiceFactory } from "../../../../factories/serviceFactory";
// import logger from "../../../../logger";
import { IDataResponse } from "../../../../models/api/IDataResponse";
import { ITransactionHistoryDownloadBody } from "../../../../models/api/stardust/chronicle/ITransactionHistoryDownloadBody";
import { ITransactionHistoryRequest } from "../../../../models/api/stardust/chronicle/ITransactionHistoryRequest";
import {
    // ITransactionHistoryResponse,
    ITransactionHistoryItem,
} from "../../../../models/api/stardust/chronicle/ITransactionHistoryResponse";
// import { IOutputDetailsResponse } from "../../../../models/api/stardust/IOutputDetailsResponse";
import { IConfiguration } from "../../../../models/configuration/IConfiguration";
import { STARDUST } from "../../../../models/db/protocolVersion";
import { NetworkService } from "../../../../services/networkService";
import { ChronicleService } from "../../../../services/stardust/chronicleService";
// import { StardustTangleHelper } from "../../../../utils/stardust/stardustTangleHelper";
import { StardustApiService } from "../../../../services/stardust/stardustApiService";
import { ValidationHelper } from "../../../../utils/validationHelper";
export type OutputWithDetails = ITransactionHistoryItem & { details: OutputResponse | null; amount?: string };

export interface ITransactionHistoryRecord {
    isGenesisByDate: boolean;
    isSpent: boolean;
    transactionId: string;
    timestamp: number;
    dateFormatted: string;
    balanceChange: number;
    balanceChangeFormatted: string;
    outputs: OutputWithDetails[];
}

/**
 * Download the transaction history from chronicle stardust.
 * @param _ The configuration.
 * @param request The request.
 * @param body The request body
 * @returns The response.
 */
export async function post(
    _: IConfiguration,
    request: ITransactionHistoryRequest,
    body: ITransactionHistoryDownloadBody,
): Promise<IDataResponse | null> {
    const networkService = ServiceFactory.get<NetworkService>("network");
    const networks = networkService.networkNames();
    ValidationHelper.oneOf(request.network, networks, "network");

    const networkConfig = networkService.get(request.network);

    if (networkConfig.protocolVersion !== STARDUST) {
        return null;
    }

    if (!networkConfig.permaNodeEndpoint) {
        return null;
    }

    const chronicleService = ServiceFactory.get<ChronicleService>(`chronicle-${networkConfig.network}`);
    const apiService = ServiceFactory.get<StardustApiService>(`api-service-${networkConfig.network}`);

    const outputs = await chronicleService.transactionHistoryDownload(request.address, body.targetDate);

    const requestOutputDetails = async (outputId: string): Promise<OutputResponse | null> => {
        if (!outputId) {
            return null;
        }

        try {
            const response = await apiService.outputDetails(outputId);
            const details = response.output;

            if (!response.error && details?.output && details?.metadata) {
                return details;
            }
            return null;
        } catch {
            console.log("Failed loading transaction history details!");
            return null;
        }
    };

    const fulfilledOutputs: OutputWithDetails[] = await Promise.all(
        outputs.items.map(async (output) => {
            const details = await requestOutputDetails(output.outputId);
            return {
                ...output,
                details,
                amount: details?.output?.amount,
            };
        }),
    );

    fulfilledOutputs.sort((a, b) => {
        // Ensure that entries with equal timestamp, but different isSpent,
        // have the spending before the depositing
        if (a.milestoneTimestamp === b.milestoneTimestamp && a.isSpent !== b.isSpent) {
            return a.isSpent ? 1 : -1;
        }
        return 1;
    });

    const transactionIdToOutputs = groupOutputsByTransactionId(fulfilledOutputs);
    const transactions = getTransactionHistoryRecords(transactionIdToOutputs);

    console.log("--- transactions", transactions);

    // let transactionIdToOutputs = new Map<string, IOutputDetailsResponse[]>();
    // const outputDetails: IOutputDetailsResponse[] = await Promise.all(
    //     outputs.items.map(async (item) => apiService.outputDetails(item.outputId)),
    // );
    // console.log("--- outputDetails", outputDetails);
    //
    // const changeBalanceByTransactionId = new Map<string, { balance: number; timestamp: number }>();
    //
    // for (const details of outputDetails) {
    //     const metadata = details.output.metadata;
    //     const amount = Number(details.output.output.amount);
    //     const timestamp = metadata.isSpent ? metadata.milestoneTimestampSpent : metadata.milestoneTimestampBooked;
    //     const transactionId = metadata.isSpent ? metadata.transactionIdSpent : metadata.transactionId;
    //
    //     const initTransactionInfo = {
    //         balance: 0,
    //         timestamp: 0,
    //     };
    //     if (!changeBalanceByTransactionId.has(transactionId)) {
    //         changeBalanceByTransactionId.set(transactionId, initTransactionInfo);
    //     }
    //     const prev = changeBalanceByTransactionId.get(transactionId);
    //     prev.balance = metadata?.isSpent ? prev.balance - amount : prev.balance + amount;
    //     prev.timestamp = Math.max(timestamp * 1000, prev.timestamp);
    //     changeBalanceByTransactionId.set(transactionId, prev);
    // }
    //
    // const headers = ["Timestamp", "TransactionId", "Balance changes"];
    //
    // let csvContent = `${headers.join(",")}\n`;
    //
    // for (const key of changeBalanceByTransactionId.keys()) {
    //     const value = changeBalanceByTransactionId.get(key);
    //     const row = [moment(value.timestamp).format("YYYY-MM-DD HH:mm:ss"), key, value.balance].join(",");
    //     csvContent += `${row}\n`;
    // }
    //
    // const jsZip = new JSZip();
    // let response: IDataResponse = null;
    //
    // try {
    //     jsZip.file("history.csv", csvContent);
    //     const content = await jsZip.generateAsync({ type: "nodebuffer" });
    //
    //     response = {
    //         data: content,
    //         contentType: "application/octet-stream",
    //     };
    // } catch (e) {
    //     logger.error(`Failed to zip transaction history for download. Cause: ${e}`);
    // }

    // return response;
    return null;
}

export const groupOutputsByTransactionId = (outputsWithDetails: OutputWithDetails[]) => {
    const transactionIdToOutputs = new Map<string, OutputWithDetails[]>();
    for (const output of outputsWithDetails) {
        const detailsMetadata = output?.details?.metadata;
        if (!detailsMetadata) {
            // eslint-disable-next-line no-continue
            continue;
        }

        const transactionId = output.isSpent ? detailsMetadata.transactionIdSpent : detailsMetadata.transactionId;

        if (!transactionId) {
            // eslint-disable-next-line no-continue
            continue;
        }

        // if we don't have the transaction
        const previousOutputs = transactionIdToOutputs.get(transactionId);
        if (previousOutputs) {
            transactionIdToOutputs.set(transactionId, [...previousOutputs, output]);
        } else {
            transactionIdToOutputs.set(transactionId, [output]);
        }
    }

    return transactionIdToOutputs;
};

export const getTransactionHistoryRecords = (transactionIdToOutputs: Map<string, OutputWithDetails[]>): ITransactionHistoryRecord[] => {
    const calculatedTransactions: ITransactionHistoryRecord[] = [];

    for (const [transactionId, outputs] of transactionIdToOutputs.entries()) {
        const lastOutputTime = Math.max(...outputs.map((t) => t.milestoneTimestamp));
        const balanceChange = calculateBalanceChange(outputs);
        const ago = moment(lastOutputTime * 1000).fromNow();

        const isGenesisByDate = outputs.map((t) => t.milestoneTimestamp).includes(0);

        const isSpent = balanceChange <= 0;

        calculatedTransactions.push({
            isGenesisByDate,
            isSpent,
            transactionId,
            timestamp: lastOutputTime,
            dateFormatted: `${moment(lastOutputTime * 1000).format("YYYY-MM-DD HH:mm:ss")} (${ago})`,
            balanceChange,
            balanceChangeFormatted: (isSpent ? "-" : "+") + Math.abs(balanceChange),
            outputs,
        });
    }
    return calculatedTransactions;
};

export const calculateBalanceChange = (outputs: OutputWithDetails[]) => {
    // eslint-disable-next-line unicorn/no-array-reduce
    return outputs.reduce((acc, output) => {
        const outputFromDetails = output?.details?.output as CommonOutput;

        if (!outputFromDetails?.amount) {
            console.warn("Output details not found for:", output);
            return acc;
        }

        let amount = Number(outputFromDetails.amount);
        if (output.isSpent) {
            // eslint-disable-next-line operator-assignment
            amount = -1 * amount;
        }
        return acc + amount;
    }, 0);
};
