import logger from "../../logger";
import { IAddressBalanceResponse } from "../../models/api/nova/chronicle/IAddressBalanceResponse";
import { ISlotBlocksRequest } from "../../models/api/nova/chronicle/ISlotBlocksRequest";
import { ISlotBlock, ISlotBlocksResponse } from "../../models/api/nova/chronicle/ISlotBlocksResponse";
import { ITransactionHistoryRequest } from "../../models/api/nova/chronicle/ITransactionHistoryRequest";
import { ITransactionHistoryResponse } from "../../models/api/nova/chronicle/ITransactionHistoryResponse";
import { INetwork } from "../../models/db/INetwork";
import { FetchHelper } from "../../utils/fetchHelper";

const CHRONICLE_ENDPOINTS = {
    updatesByAddress: "/api/explorer/v3/ledger/updates/by-address/",
    balance: "/api/explorer/v3/balance/",
    slotBlocks: "api/explorer/v3/commitments/by-index/{slot-index}/blocks",
};

export class ChronicleService {
    /**
     * The endpoint for performing communications.
     */
    private readonly chronicleEndpoint: string;

    /**
     * The network config in context.
     */
    private readonly networkConfig: INetwork;

    constructor(config: INetwork) {
        this.networkConfig = config;
        this.chronicleEndpoint = config.permaNodeEndpoint;
    }

    /**
     * Get the current address balance info.
     * @param address The address to fetch the balance for.
     * @returns The address balance response.
     */
    public async addressBalance(address: string): Promise<IAddressBalanceResponse | undefined> {
        try {
            return await FetchHelper.json<never, IAddressBalanceResponse>(
                this.chronicleEndpoint,
                `${CHRONICLE_ENDPOINTS.balance}${address}`,
                "get",
            );
        } catch (error) {
            const network = this.networkConfig.network;
            logger.warn(`[ChronicleService (Nova)] Failed fetching address balance for ${address} on ${network}. Cause: ${error}`);
        }
    }

    /**
     * Get the slot blocks for a specific slot index.
     * @param request The slots blocks request.
     * @returns The slot blocks response.
     */
    public async getSlotBlocks(request: ISlotBlocksRequest): Promise<ISlotBlocksResponse | undefined> {
        let cursor: string | undefined;
        const slotBlocks: ISlotBlock[] = [];

        do {
            try {
                const params = { cursor };
                const response = await FetchHelper.json<never, ISlotBlocksResponse>(
                    this.chronicleEndpoint,
                    `${CHRONICLE_ENDPOINTS.slotBlocks}${params ? `${FetchHelper.urlParams(params)}` : ""}`.replace(
                        "{slot-index}",
                        request.slotIndex,
                    ),
                    "get",
                );
                cursor = response.cursor;

                if (response.blocks) {
                    slotBlocks.push(...response.blocks);
                }
            } catch (error) {
                const network = this.networkConfig.network;
                logger.warn(
                    `[ChronicleService (Nova)] Failed fetching slot blocks for ${request.slotIndex} on ${network}. Cause: ${error}`,
                );
            }
        } while (cursor);

        const sortedBlocks = slotBlocks.sort((a, b) => b.payloadType - a.payloadType);

        return {
            blocks: sortedBlocks,
        };
    }

    /*
     * Get the transaction history of an address.
     * @param request The ITransactionHistoryRequest.
     * @returns The history reponse.
     */
    public async transactionHistory(request: ITransactionHistoryRequest): Promise<ITransactionHistoryResponse | undefined> {
        try {
            const params = {
                pageSize: request.pageSize,
                sort: request.sort,
                startSlotIndex: request.startSlotIndex,
                cursor: request.cursor,
            };

            return await FetchHelper.json<never, ITransactionHistoryResponse>(
                this.chronicleEndpoint,
                `${CHRONICLE_ENDPOINTS.updatesByAddress}${request.address}${params ? `${FetchHelper.urlParams(params)}` : ""}`,
                "get",
            );
        } catch (error) {
            const network = this.networkConfig.network;
            logger.warn(`[ChronicleService] Failed fetching tx history for ${request.address} on ${network}. Cause: ${error}`);
        }
    }
}
