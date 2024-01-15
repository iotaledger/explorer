import JSZip from "jszip";
import moment from "moment";
import { ServiceFactory } from "../../../../factories/serviceFactory";
import logger from "../../../../logger";
import { IDataResponse } from "../../../../models/api/IDataResponse";
import { ITransactionHistoryDownloadBody } from "../../../../models/api/stardust/chronicle/ITransactionHistoryDownloadBody";
import { ITransactionHistoryRequest } from "../../../../models/api/stardust/chronicle/ITransactionHistoryRequest";
import { IOutputDetailsResponse } from "../../../../models/api/stardust/IOutputDetailsResponse";
import { IConfiguration } from "../../../../models/configuration/IConfiguration";
import { STARDUST } from "../../../../models/db/protocolVersion";
import { NetworkService } from "../../../../services/networkService";
import { ChronicleService } from "../../../../services/stardust/chronicleService";
import { StardustTangleHelper } from "../../../../utils/stardust/stardustTangleHelper";
import { ValidationHelper } from "../../../../utils/validationHelper";

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

    const result = await chronicleService.transactionHistoryDownload(request.address, body.targetDate);

    const outputDetails: IOutputDetailsResponse[] = await Promise.all(
        result.items.map(async (item) => StardustTangleHelper.outputDetails(networkConfig, item.outputId)),
    );

    const changeBalanceByTransactionId = new Map<string, { balance: number; timestamp: number }>();

    for (const details of outputDetails) {
        const metadata = details.output.metadata;
        const amount = Number(details.output.output.amount);
        const timestamp = metadata.isSpent ? metadata.milestoneTimestampSpent : metadata.milestoneTimestampBooked;
        const transactionId = metadata.isSpent ? metadata.transactionIdSpent : metadata.transactionId;

        const initTransactionInfo = {
            balance: 0,
            timestamp: 0,
        };
        if (!changeBalanceByTransactionId.has(transactionId)) {
            changeBalanceByTransactionId.set(transactionId, initTransactionInfo);
        }
        const prev = changeBalanceByTransactionId.get(transactionId);
        prev.balance = metadata?.isSpent ? prev.balance - amount : prev.balance + amount;
        prev.timestamp = Math.max(timestamp * 1000, prev.timestamp);
        changeBalanceByTransactionId.set(transactionId, prev);
    }

    const headers = ["Timestamp", "TransactionId", "Balance changes"];

    let csvContent = `${headers.join(",")}\n`;

    for (const key of changeBalanceByTransactionId.keys()) {
        const value = changeBalanceByTransactionId.get(key);
        const row = [moment(value.timestamp).format("YYYY-MM-DD HH:mm:ss"), key, value.balance].join(",");
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
