import { CommonOutput, INodeInfoBaseToken, OutputResponse } from "@iota/sdk-stardust";
import JSZip from "jszip";
import moment from "moment";
import { ServiceFactory } from "../../../../factories/serviceFactory";
import logger from "../../../../logger";
import { IDataResponse } from "../../../../models/api/IDataResponse";
import { ITransactionHistoryDownloadBody } from "../../../../models/api/stardust/chronicle/ITransactionHistoryDownloadBody";
import { ITransactionHistoryRequest } from "../../../../models/api/stardust/chronicle/ITransactionHistoryRequest";
import { ITransactionHistoryItem } from "../../../../models/api/stardust/chronicle/ITransactionHistoryResponse";
import { IConfiguration } from "../../../../models/configuration/IConfiguration";
import { INetwork } from "../../../../models/db/INetwork";
import { MAINNET } from "../../../../models/db/networkType";
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
    outputIdFromSupplyIncrease?: string;
    timestamp: number;
    dateFormatted: string;
    balanceChange: number;
    balanceChangeFormatted: string;
    outputs: OutputWithDetails[];
}

const STARDUST_GENESIS_MILESTONE = 7669900;

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
    ValidationHelper.oneOf(request.network, networkService.networkNames(), "network");

    const networkConfig = networkService.get(request.network);

    const nodeInfoService = ServiceFactory.get<NodeInfoService>(`node-info-${request.network}`);
    if (networkConfig.protocolVersion !== STARDUST || !networkConfig.permaNodeEndpoint) {
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
    const tokenInfo = nodeInfoService.getNodeInfo().baseToken;

    const transactions = getTransactionHistoryRecords(groupOutputsByTransactionId(fulfilledOutputs), tokenInfo, networkConfig);

    const headers = ["Timestamp", "TransactionId", "Balance changes"];

    let csvContent = `${headers.join(",")}\n`;

    for (const transaction of transactions) {
        let transactionCell = transaction.transactionId;
        if (transaction.isGenesisByDate) {
            transactionCell = `Stardust Genesis (Chrysalis):  ${transactionCell}`;
            if (transaction.outputIdFromSupplyIncrease) {
                transactionCell = `Supply Increase Output: ${transaction.outputIdFromSupplyIncrease}`;
            }
        }
        const row = [transaction.dateFormatted, transactionCell, transaction.balanceChangeFormatted].join(",");
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
        console.warn("Failed loading transaction history details!");
        return null;
    }
};

export const groupOutputsByTransactionId = (outputsWithDetails: OutputWithDetails[]) => {
    const transactionIdToOutputs = new Map<string, OutputWithDetails[]>();
    for (const output of outputsWithDetails) {
        const detailsMetadata = output?.details?.metadata;
        const transactionId = output.isSpent ? detailsMetadata.transactionIdSpent : detailsMetadata.transactionId;
        if (detailsMetadata && transactionId) {
            const previousOutputs = transactionIdToOutputs.get(transactionId) || [];
            transactionIdToOutputs.set(transactionId, [...previousOutputs, output]);
        }
    }

    return transactionIdToOutputs;
};

export const getTransactionHistoryRecords = (
    transactionIdToOutputs: Map<string, OutputWithDetails[]>,
    tokenInfo: INodeInfoBaseToken,
    networkConfig: INetwork,
): ITransactionHistoryRecord[] => {
    const calculatedTransactions: ITransactionHistoryRecord[] = [];

    for (const [transactionId, outputs] of transactionIdToOutputs.entries()) {
        const lastOutputTime = Math.max(...outputs.map((t) => t.milestoneTimestamp));
        const balanceChange = calculateBalanceChange(outputs);
        const isSpent = balanceChange <= 0;
        const isGenesisByDate = outputs.some((output) => output.milestoneIndex === STARDUST_GENESIS_MILESTONE);

        let outputIdFromSupplyIncrease;
        if (isGenesisByDate) {
            outputIdFromSupplyIncrease = getStardustGenesisOutputId(outputs, networkConfig, transactionId);
        }

        calculatedTransactions.push({
            isGenesisByDate,
            isSpent,
            transactionId,
            outputIdFromSupplyIncrease,
            timestamp: lastOutputTime,
            dateFormatted: moment(lastOutputTime * 1000).format("YYYY-MM-DD HH:mm:ss"),
            balanceChange,
            balanceChangeFormatted: formatAmount(Math.abs(balanceChange), tokenInfo, false, isSpent),
            outputs,
        });
    }
    return calculatedTransactions;
};

/**
 * Get the output id from the stardust genesis.
 * @param outputs List of outputs related to transaction
 * @param networkConfig Network configuration
 * @param transactionId Current trancaction
 * @returns The output id from the stardust genesis or undefined.
 */
function getStardustGenesisOutputId(outputs: OutputWithDetails[], networkConfig: INetwork, transactionId: string): string | undefined {
    const STARDUST_SUPPLY_INCREASE_OUTPUT_TICKER = "0xb191c4bc825ac6983789e50545d5ef07a1d293a98ad974fc9498cb18";

    const outputFromStardustGenesis = outputs.find((output) => {
        if (
            networkConfig.network === MAINNET &&
            output.milestoneIndex === STARDUST_GENESIS_MILESTONE &&
            transactionId.includes(STARDUST_SUPPLY_INCREASE_OUTPUT_TICKER)
        ) {
            return true;
        }
    });
    return outputFromStardustGenesis?.outputId;
}

export const calculateBalanceChange = (outputs: OutputWithDetails[]) => {
    let totalAmount = 0;

    for (const output of outputs) {
        const outputFromDetails = output?.details?.output as CommonOutput;

        // Perform the calculation only if outputFromDetails and amount are defined
        if (outputFromDetails?.amount) {
            let amount = Number(outputFromDetails.amount);
            if (output.isSpent) {
                amount *= -1;
            }
            totalAmount += amount;
        } else {
            console.warn("Output details not found for:", output);
        }
    }

    return totalAmount;
};

/**
 * Formats a numeric value into a string using token information and specified formatting rules.
 *
 * @param value - The value to format.
 * @param tokenInfo - Information about the token, including units and decimals.
 * @param formatFull - If true, formats the entire number. Otherwise, uses decimalPlaces.
 * @param isSpent - boolean indicating if the amount is spent or not. Need to provide right symbol.
 * @returns The formatted amount with the token unit.
 */
export function formatAmount(value: number, tokenInfo: INodeInfoBaseToken, formatFull: boolean = false, isSpent: boolean = false): string {
    let isSpentSymbol = isSpent ? "-" : "+";

    if (!value) {
        // 0 is not spent
        isSpentSymbol = "";
    }

    if (formatFull) {
        return `${isSpentSymbol}${value} ${tokenInfo.subunit ?? tokenInfo.unit}`;
    }

    const baseTokenValue = value / Math.pow(10, tokenInfo.decimals);
    const formattedAmount = cropNumber(baseTokenValue);

    return `${isSpentSymbol}${formattedAmount} ${tokenInfo.unit}`;
}

/**
 * Crops the fractional part of a number to 6 digits.
 * @param value The value to crop.
 * @param decimalPlaces - The number of decimal places to include in the formatted output.
 * @returns The cropped value.
 */
function cropNumber(value: number, decimalPlaces: number = 6): string {
    const valueAsString = value.toString();

    if (!valueAsString.includes(".")) {
        return valueAsString;
    }

    const [integerPart, rawFractionalPart] = valueAsString.split(".");
    let fractionalPart = rawFractionalPart;

    if (fractionalPart.length > decimalPlaces) {
        fractionalPart = fractionalPart.slice(0, 6);
    }
    fractionalPart = fractionalPart.replace(/0+$/, "");

    return fractionalPart ? `${integerPart}.${fractionalPart}` : integerPart;
}
