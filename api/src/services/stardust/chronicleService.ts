import { MILESTONE_PAYLOAD_TYPE, RECEIPT_MILESTONE_OPTION_TYPE, TAGGED_DATA_PAYLOAD_TYPE, TRANSACTION_PAYLOAD_TYPE } from "@iota/iota.js-stardust";
import moment from "moment";
import { IAddressBalanceResponse } from "../../models/api/stardust/IAddressBalanceResponse";
import { ITransactionHistoryDownloadResponse } from "../../models/api/stardust/ITransactionHistoryDownloadResponse";
import { ITransactionHistoryRequest } from "../../models/api/stardust/ITransactionHistoryRequest";
import { ITransactionHistoryResponse } from "../../models/api/stardust/ITransactionHistoryResponse";
import { IMilestoneAnalyticStats } from "../../models/api/stats/IMilestoneAnalyticStats";
import { INetwork } from "../../models/db/INetwork";
import { FetchHelper } from "../../utils/fetchHelper";
import { StardustTangleHelper } from "../../utils/stardust/stardustTangleHelper";

const CHRONICLE_ENDPOINTS = {
    updatedByAddress: "/api/explorer/v2/ledger/updates/by-address/",
    balance: "/api/explorer/v2/balance/",
    milestoneBlocks: ["/api/explorer/v2/milestones/", "/blocks"]
};

export class ChronicleService {
    /**
     * The endpoint for performing communications.
     */
    private readonly _endpoint: string;

    constructor(config: INetwork) {
        this._endpoint = config.permaNodeEndpoint;
    }

    /**
     * Get the current address balance info.
     * @param address The address to fetch the balance for.
     * @returns The address balance response.
     */
    public async addressBalance(
        address: string
    ): Promise<IAddressBalanceResponse | undefined> {
        try {
            return await FetchHelper.json<never, IAddressBalanceResponse>(
                this._endpoint,
                `${CHRONICLE_ENDPOINTS.balance}${address}`,
                "get"
            );
        } catch (error) {
            return { error };
        }
    }

    /**
     * Get the blocks in a given milestone.
     * @param milestoneId The milestone id.
     * @returns The milestone blocks response.
     */
    public async milestoneBlocks(
        milestoneId: string
    ): Promise<{ milestoneId?: string; blocks?: string[]; error?: string } | undefined> {
        const path = `${CHRONICLE_ENDPOINTS.milestoneBlocks[0]}${milestoneId}${CHRONICLE_ENDPOINTS.milestoneBlocks[1]}`;
        let cursor: string | undefined;
        const blocks: string[] = [];

        do {
            const params = FetchHelper.urlParams({ pageSize: 10, sort: "newest", cursor });

            try {
                const response = await FetchHelper.json<never, { blocks?: string[]; cursor?: string }>(
                    this._endpoint,
                    `${path}${params}`,
                    "get"
                );

                cursor = response.cursor;

                if (response.blocks) {
                    blocks.push(...response.blocks);
                }
            } catch (error) {
                return { error };
            }
        } while (cursor);

        return { milestoneId, blocks };
    }

    /**
     * Get the current milestone stats by milestoneId
     * @param network The network in context.
     * @param milestoneId The milestone id.
     * @returns The milestone stats.
     */
    public async milestoneAnalytics(
        network: INetwork,
        milestoneId: string
    ): Promise<IMilestoneAnalyticStats | undefined> {
        let analyticStats: IMilestoneAnalyticStats = {};
        let txPayloadCount: number = 0;
        let txTreasuryPayloadCount: number = 0;
        let milestonePayloadCount: number = 0;
        let taggedDataPayloadCount: number = 0;
        let noPayloadCount: number = 0;

        try {
            // hack to retry untill blocks are there from chronicle
            let retry = 0;
            let blockIdsResponse = await this.milestoneBlocks(milestoneId);

            while (
                !blockIdsResponse.error &&
                (!blockIdsResponse.blocks || blockIdsResponse.blocks?.length === 0) &&
                retry < 6
            ) {
                retry += 1;
                blockIdsResponse = await this.milestoneBlocks(milestoneId);
                setTimeout(() => {}, 500);
            }

            if (!blockIdsResponse.error) {
                for (const blockId of blockIdsResponse.blocks) {
                    const blockResponse = await StardustTangleHelper.block(network, blockId);

                    switch (blockResponse.block?.payload?.type) {
                        case TAGGED_DATA_PAYLOAD_TYPE:
                            taggedDataPayloadCount += 1;
                            break;
                        case TRANSACTION_PAYLOAD_TYPE:
                            txPayloadCount += 1;
                            break;
                        case MILESTONE_PAYLOAD_TYPE:
                            milestonePayloadCount += 1;
                            if (blockResponse.block?.payload?.options) {
                                for (const option of blockResponse.block.payload.options) {
                                    if (option?.type === RECEIPT_MILESTONE_OPTION_TYPE) {
                                        txTreasuryPayloadCount += 1;
                                    }
                                }
                            }
                            break;
                        default:
                        case undefined:
                            noPayloadCount += 1;
                            break;
                    }
                }

                analyticStats = {
                    blocksCount: blockIdsResponse.blocks.length,
                    perPayloadType: {
                        txPayloadCount,
                        txTreasuryPayloadCount,
                        milestonePayloadCount,
                        taggedDataPayloadCount,
                        noPayloadCount
                    }
                };
            } else {
                return { error: blockIdsResponse.error };
            }
        } catch (error) {
            return { error };
        }

        return analyticStats;
    }

    /**
     * Get the transaction history of an address.
     * @param request The ITransactionHistoryRequest.
     * @returns The history reponse.
     */
    public async transactionHistory(
        request: ITransactionHistoryRequest
    ): Promise<ITransactionHistoryResponse | undefined> {
        try {
            const params = {
                pageSize: request.pageSize,
                sort: request.sort,
                startMilestoneIndex: request.startMilestoneIndex,
                cursor: request.cursor
            };

            return await FetchHelper.json<never, ITransactionHistoryResponse>(
                this._endpoint,
                `${CHRONICLE_ENDPOINTS.updatedByAddress}${request.address}${params ?
                    `${FetchHelper.urlParams(params)}` :
                    ""}`,
                "get"
            );
        } catch (error) {
            return { error };
        }
    }

    /**
     * Download the transaction history of an address.
     * @param address The address to download history for.
     * @param targetDate The date to use.
     * @returns The history reponse.
     */
    public async transactionHistoryDownload(
        address: string,
        targetDate: string
    ): Promise<ITransactionHistoryDownloadResponse | undefined> {
        try {
            let response: ITransactionHistoryResponse | undefined;
            let cursor: string | undefined;
            let isDone = false;
            const result: ITransactionHistoryDownloadResponse = {
                address,
                items: []
            };

            do {
                const params = FetchHelper.urlParams({ pageSize: 20, sort: "newest", cursor });

                response = await FetchHelper.json<never, ITransactionHistoryResponse>(
                    this._endpoint,
                    `${CHRONICLE_ENDPOINTS.updatedByAddress}${address}${params}`,
                    "get"
                );

                cursor = response.cursor;

                for (const item of response.items) {
                    const itemTimestamp = item.milestoneTimestamp * 1000;

                    if (targetDate && moment(itemTimestamp).isBefore(targetDate)) {
                        isDone = true;
                    } else {
                        result.items.push(item);
                    }
                }
            } while (!isDone && cursor);

            result.items.sort((a, b) => {
                if (a.milestoneTimestamp === b.milestoneTimestamp && a.isSpent !== b.isSpent) {
                    return !a.isSpent ? -1 : 1;
                }
                return 1;
            });

            return result;
        } catch (error) {
            console.log("Problem while building Transaction History download", error);
        }
    }
}
