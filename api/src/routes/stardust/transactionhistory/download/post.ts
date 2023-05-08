import JSZip from "jszip";
import { ServiceFactory } from "../../../../factories/serviceFactory";
import logger from "../../../../logger";
import { IDataResponse } from "../../../../models/api/IDataResponse";
import { ITransactionHistoryDownloadBody } from "../../../../models/api/stardust/chronicle/ITransactionHistoryDownloadBody";
import { ITransactionHistoryRequest } from "../../../../models/api/stardust/chronicle/ITransactionHistoryRequest";
import { IConfiguration } from "../../../../models/configuration/IConfiguration";
import { STARDUST } from "../../../../models/db/protocolVersion";
import { NetworkService } from "../../../../services/networkService";
import { ChronicleService } from "../../../../services/stardust/chronicleService";
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
    body: ITransactionHistoryDownloadBody
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

    const chronicleService = ServiceFactory.get<ChronicleService>(
        `chronicle-${networkConfig.network}`
    );

    const result = await chronicleService.transactionHistoryDownload(request.address, body.targetDate);

    const jsZip = new JSZip();
    let response: IDataResponse = null;

    try {
        jsZip.file("history.json", JSON.stringify(result));
        const content = await jsZip.generateAsync({ type: "nodebuffer" });

        response = {
            data: content,
            contentType: "application/octet-stream"
        };
    } catch (e) {
        logger.error(`Failed to zip transaction history for download. Cause: ${e}`);
    }

    return response;
}

