import { UnitsHelper } from "@iota/iota.js";
import JSZip from "jszip";
import moment from "moment";
import { ServiceFactory } from "../../../../factories/serviceFactory";
import logger from "../../../../logger";
import { IDataResponse } from "../../../../models/api/IDataResponse";
import { ITransactionHistoryDownloadBody } from "../../../../models/api/stardust/chronicle/ITransactionHistoryDownloadBody";
import { ITransactionHistoryRequest } from "../../../../models/api/stardust/chronicle/ITransactionHistoryRequest";
import { IConfiguration } from "../../../../models/configuration/IConfiguration";
import { CHRYSALIS } from "../../../../models/db/protocolVersion";
import { NetworkService } from "../../../../services/networkService";
import { ChrysalisTangleHelper } from "../../../../utils/chrysalis/chrysalisTangleHelper";
import { ValidationHelper } from "../../../../utils/validationHelper";

interface IParsedRow {
    messageId: string;
    transactionId: string;
    referencedByMilestoneIndex: string;
    milestoneTimestampReferenced: string;
    timestampFormatted: string;
    ledgerInclusionState: string;
    conflictReason: string;
    inputsCount: string;
    outputsCount: string;
    addressBalanceChange: string;
    addressBalanceChangeFormatted: string;
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
    ValidationHelper.oneOf(request.network, networkService.networkNames(), "network");

    const networkConfig = networkService.get(request.network);

    if (networkConfig.protocolVersion !== CHRYSALIS || !networkConfig.permaNodeEndpoint || !request.address) {
        return null;
    }

    const transactionHistoryDownload = await ChrysalisTangleHelper.transactionHistoryDownload(networkConfig, request.address);

    const parsed = parseResponse(transactionHistoryDownload);

    let csvContent = `${["Timestamp", "TransactionId", "Balance changes"].join(",")}\n`;

    const filtered = parsed.body.filter((row) => {
        return moment(row.milestoneTimestampReferenced).isAfter(body.targetDate);
    });

    for (const i of filtered) {
        const row = [i.timestampFormatted, i.transactionId, i.addressBalanceChangeFormatted].join(",");
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

/**
 * Split response into lines, format each line
 * @param response The response from endpoint to parse.
 * @returns Object with headers and body.
 */
function parseResponse(response: string) {
    const lines = response.split("\n");
    let isHeadersSet = false;
    let headers: IParsedRow; // Headers: "MessageID", "TransactionID", "ReferencedByMilestoneIndex", "MilestoneTimestampReferenced", "LedgerInclusionState", "ConflictReason", "InputsCount", "OutputsCount", "AddressBalanceChange"
    const body: IParsedRow[] = [];

    for (const line of lines) {
        const row = parseRow(line);

        if (row) {
            if (isHeadersSet) {
                body.push(row);
            } else {
                headers = row;
                isHeadersSet = true;
            }
        }
    }

    return { headers, body };
}

/**
 *  @param row The row to parse.
 *  @returns Object with parsed and formatted values.
 */
function parseRow(row: string): IParsedRow {
    const cols = row.split(",");
    if (!cols || cols.length < 9) {
        return null;
    }

    const [
        messageId,
        transactionId,
        referencedByMilestoneIndex,
        milestoneTimestampReferenced,
        ledgerInclusionState,
        conflictReason,
        inputsCount,
        outputsCount,
        addressBalanceChange,
    ] = cols;

    const timestamp = milestoneTimestampReferenced.replaceAll("\"", "");

    return {
        messageId,
        transactionId,
        referencedByMilestoneIndex,
        milestoneTimestampReferenced: timestamp,
        timestampFormatted: moment(timestamp).format("YYYY-MM-DD HH:mm:ss"),
        ledgerInclusionState,
        conflictReason,
        inputsCount,
        outputsCount,
        addressBalanceChange,
        addressBalanceChangeFormatted: UnitsHelper.formatBest(Number(addressBalanceChange)),
    };
}
