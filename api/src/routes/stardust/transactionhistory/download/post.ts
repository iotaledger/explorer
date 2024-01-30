import { OutputResponse, INodeInfoBaseToken, CommonOutput } from "@iota/sdk";
import JSZip from "jszip";
import moment from "moment";
import { ServiceFactory } from "../../../../factories/serviceFactory";
import logger from "../../../../logger";
import { IDataResponse } from "../../../../models/api/IDataResponse";
import { ITransactionHistoryDownloadBody } from "../../../../models/api/stardust/chronicle/ITransactionHistoryDownloadBody";
import { ITransactionHistoryRequest } from "../../../../models/api/stardust/chronicle/ITransactionHistoryRequest";
import { ITransactionHistoryItem } from "../../../../models/api/stardust/chronicle/ITransactionHistoryResponse";
import { IConfiguration } from "../../../../models/configuration/IConfiguration";
import { STARDUST } from "../../../../models/db/protocolVersion";
import { NetworkService } from "../../../../services/networkService";
import { ChronicleService } from "../../../../services/stardust/chronicleService";
import { NodeInfoService } from "../../../../services/stardust/nodeInfoService";
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

    const nodeInfoService = ServiceFactory.get<NodeInfoService>(`node-info-${request.network}`);
    const tokenInfo = nodeInfoService.getNodeInfo().baseToken;

    if (networkConfig.protocolVersion !== STARDUST) {
        return null;
    }

    if (!networkConfig.permaNodeEndpoint) {
        return null;
    }

    const chronicleService = ServiceFactory.get<ChronicleService>(`chronicle-${networkConfig.network}`);

    const outputs = await chronicleService.transactionHistoryDownload(request.address, body.targetDate);

    const fulfilledOutputs: OutputWithDetails[] = await Promise.all(
        outputs.items.map(async (output) => {
            const details = await requestOutputDetails(output.outputId, networkConfig.network);
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
    const transactions = getTransactionHistoryRecords(transactionIdToOutputs, tokenInfo);

    const headers = ["Timestamp", "TransactionId", "Balance changes"];

    let csvContent = `${headers.join(",")}\n`;

    for (const transaction of transactions) {
        const row = [transaction.dateFormatted, transaction.transactionId, transaction.balanceChangeFormatted].join(",");
        csvContent += `${row}\n`;
    }

    const jsZip = new JSZip();
    let response: IDataResponse = null;

    try {
        jsZip.file("history.csv", csvContent);
        const content = await jsZip.generateAsync({ type: "nodebuffer" });

        response = {
            data: content,
            contentType: "application/octet-stream",
        };
    } catch (e) {
        logger.error(`Failed to zip transaction history for download. Cause: ${e}`);
    }

    return response;
}

const requestOutputDetails = async (outputId: string, network: string): Promise<OutputResponse | null> => {
    if (!outputId) {
        return null;
    }

    const apiService = ServiceFactory.get<StardustApiService>(`api-service-${network}`);

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

export const getTransactionHistoryRecords = (
    transactionIdToOutputs: Map<string, OutputWithDetails[]>,
    tokenInfo: INodeInfoBaseToken,
): ITransactionHistoryRecord[] => {
    const calculatedTransactions: ITransactionHistoryRecord[] = [];

    for (const [transactionId, outputs] of transactionIdToOutputs.entries()) {
        const lastOutputTime = Math.max(...outputs.map((t) => t.milestoneTimestamp));
        const balanceChange = calculateBalanceChange(outputs);

        const isGenesisByDate = outputs.map((t) => t.milestoneTimestamp).includes(0);

        const isSpent = balanceChange <= 0;

        calculatedTransactions.push({
            isGenesisByDate,
            isSpent,
            transactionId,
            timestamp: lastOutputTime,
            dateFormatted: moment(lastOutputTime * 1000).format("YYYY-MM-DD HH:mm:ss"),
            balanceChange,
            balanceChangeFormatted: (isSpent ? "-" : "+") + formatAmount(Math.abs(balanceChange), tokenInfo, false, 2, true),
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
            amount *= -1;
        }
        return acc + amount;
    }, 0);
};

/**
 * Formats a numeric value into a string using token information and specified formatting rules.
 *
 * @param {number} value - The value to format.
 * @param {INodeInfoBaseToken} tokenInfo - Information about the token, including units and decimals.
 * @param {boolean} [formatFull=false] - If true, formats the entire number. Otherwise, uses decimalPlaces.
 * @param {number} [decimalPlaces=2] - Number of decimal places in the formatted output.
 * @param {boolean} [trailingDecimals] - Determines inclusion of trailing zeros in decimals.
 * @returns {string} The formatted amount with the token unit.
 */
export function formatAmount(
    value: number,
    tokenInfo: INodeInfoBaseToken,
    formatFull: boolean = false,
    decimalPlaces: number = 2,
    trailingDecimals?: boolean,
): string {
    if (formatFull) {
        return `${value} ${tokenInfo.subunit ?? tokenInfo.unit}`;
    }

    const baseTokenValue = value / Math.pow(10, tokenInfo.decimals);
    const formattedAmount = toFixedNoRound(baseTokenValue, decimalPlaces, trailingDecimals);

    return `${formattedAmount} ${tokenInfo.unit}`;
}

/**
 * Format amount to two decimal places without rounding off.
 * @param value The raw amount to format.
 * @param precision The decimal places to show.
 * @param trailingDecimals Whether to show trailing decimals.
 * @returns The formatted amount.
 */
function toFixedNoRound(value: number, precision: number = 2, trailingDecimals?: boolean): string {
    const defaultDecimals = "0".repeat(precision);
    const valueString = `${value}`;
    const [integer, fraction = defaultDecimals] = valueString.split(".");

    if (fraction === defaultDecimals && !trailingDecimals) {
        return valueString;
    }

    if (!precision) {
        return integer;
    }

    const truncatedFraction = fraction.slice(0, precision);

    // avoid 0.00 case
    if (!Number(truncatedFraction)) {
        return `${integer}.${fraction}`;
    }

    return `${integer}.${truncatedFraction}`;
}
