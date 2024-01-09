import moment from "moment";
import logger from "../../logger";
import { IAddressBalanceResponse } from "../../models/api/stardust/chronicle/IAddressBalanceResponse";
import { IBlockChildrenResponse } from "../../models/api/stardust/chronicle/IBlockChildrenResponse";
import { IRichAddress, IRichestAddressesResponse } from "../../models/api/stardust/chronicle/IRichestAddressesResponse";
import { IDistributionEntry, ITokenDistributionResponse } from "../../models/api/stardust/chronicle/ITokenDistributionResponse";
import { ITransactionHistoryDownloadResponse } from "../../models/api/stardust/chronicle/ITransactionHistoryDownloadResponse";
import { ITransactionHistoryRequest } from "../../models/api/stardust/chronicle/ITransactionHistoryRequest";
import { ITransactionHistoryResponse } from "../../models/api/stardust/chronicle/ITransactionHistoryResponse";
import { IMilestoneBlockInfo } from "../../models/api/stardust/milestone/IMilestoneBlocksResponse";
import { INetwork } from "../../models/db/INetwork";
import { FetchHelper } from "../../utils/fetchHelper";

const RICH_ADDRESSES_N = 100;
const RICH_ADDR_TOKEN_DIST_REFRESH_INTERVAL_MS = 60000;

const CHRONICLE_ENDPOINTS = {
  updatedByAddress: "/api/explorer/v2/ledger/updates/by-address/",
  richestAddresses: "/api/explorer/v2/ledger/richest-addresses",
  tokenDistribution: "/api/explorer/v2/ledger/token-distribution",
  balance: "/api/explorer/v2/balance/",
  milestoneBlocks: ["/api/explorer/v2/milestones/", "/blocks"],
  blockChildren: ["/api/explorer/v2/blocks/", "/children"],
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

  /**
   * The richest addresses cached data.
   */
  private richestAddressesCache: { top: IRichAddress[]; ledgerIndex: number } | null = null;

  /**
   * The token distribution cached data.
   */
  private tokenDistributionCache: { distribution: IDistributionEntry[]; ledgerIndex: number } | null = null;

  /**
   * The nodeJS timer for data refresh.
   */
  private cacheTimer: NodeJS.Timer | null = null;

  constructor(config: INetwork) {
    this.networkConfig = config;
    this.chronicleEndpoint = config.permaNodeEndpoint;
    this.setupCachePopulation();
  }

  /**
   * Get the current richest addresses data.
   * @returns The current richest addresses data.
   */
  public get richestAddressesLatest() {
    return this.richestAddressesCache;
  }

  /**
   * Get the current token distribution data.
   * @returns The current token distribution data.
   */
  public get tokenDistributionLatest() {
    return this.tokenDistributionCache;
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
      logger.warn(`[ChronicleService] Failed fetching address balance for ${address} on ${network}. Cause: ${error}`);
    }
  }

  /**
   * Get the blocks in a given milestone.
   * @param milestoneId The milestone id.
   * @returns The milestone blocks response.
   */
  public async milestoneBlocks(milestoneId: string): Promise<{ milestoneId?: string; blocks?: string[]; error?: string } | undefined> {
    const path = `${CHRONICLE_ENDPOINTS.milestoneBlocks[0]}${milestoneId}${CHRONICLE_ENDPOINTS.milestoneBlocks[1]}`;
    let cursor: string | undefined;
    const blocks: IMilestoneBlockInfo[] = [];

    do {
      const params = FetchHelper.urlParams({ pageSize: 10, sort: "newest", cursor });

      try {
        const response = await FetchHelper.json<never, { blocks?: IMilestoneBlockInfo[]; cursor?: string }>(
          this.chronicleEndpoint,
          `${path}${params}`,
          "get",
        );

        cursor = response.cursor;

        if (response.blocks) {
          blocks.push(...response.blocks);
        }
      } catch (error) {
        const network = this.networkConfig.network;
        logger.warn(`[ChronicleService] Failed fetching milestone blocks for ${milestoneId} on ${network}. ${error}`);
      }
    } while (cursor);

    const blockIds = blocks.sort((a, b) => b.payloadType - a.payloadType).map((block) => block.blockId);

    return { milestoneId, blocks: blockIds };
  }

  /**
   * Get the block children.
   * @param blockId The block id.
   * @returns The blocks children response.
   */
  public async blockChildren(blockId: string): Promise<IBlockChildrenResponse | undefined> {
    const path = `${CHRONICLE_ENDPOINTS.blockChildren[0]}${blockId}${CHRONICLE_ENDPOINTS.blockChildren[1]}`;

    try {
      const response = await FetchHelper.json<never, IBlockChildrenResponse>(this.chronicleEndpoint, `${path}`, "get");

      return response;
    } catch (error) {
      const network = this.networkConfig.network;
      logger.warn(`[ChronicleService] Failed fetching block children for ${blockId} on ${network}. Cause: ${error}`);
      return { error };
    }
  }

  /**
   * Get the transaction history of an address.
   * @param request The ITransactionHistoryRequest.
   * @returns The history reponse.
   */
  public async transactionHistory(request: ITransactionHistoryRequest): Promise<ITransactionHistoryResponse | undefined> {
    try {
      const params = {
        pageSize: request.pageSize,
        sort: request.sort,
        startMilestoneIndex: request.startMilestoneIndex,
        cursor: request.cursor,
      };

      return await FetchHelper.json<never, ITransactionHistoryResponse>(
        this.chronicleEndpoint,
        `${CHRONICLE_ENDPOINTS.updatedByAddress}${request.address}${params ? `${FetchHelper.urlParams(params)}` : ""}`,
        "get",
      );
    } catch (error) {
      const network = this.networkConfig.network;
      logger.warn(`[ChronicleService] Failed fetching tx history for ${request.address} on ${network}. Cause: ${error}`);
    }
  }

  /**
   * Download the transaction history of an address.
   * @param address The address to download history for.
   * @param targetDate The date to use.
   * @returns The history reponse.
   */
  public async transactionHistoryDownload(address: string, targetDate: string): Promise<ITransactionHistoryDownloadResponse | undefined> {
    try {
      let response: ITransactionHistoryResponse | undefined;
      let cursor: string | undefined;
      let isDone = false;
      const result: ITransactionHistoryDownloadResponse = {
        address,
        items: [],
      };

      do {
        const params = FetchHelper.urlParams({ pageSize: 20, sort: "newest", cursor });

        response = await FetchHelper.json<never, ITransactionHistoryResponse>(
          this.chronicleEndpoint,
          `${CHRONICLE_ENDPOINTS.updatedByAddress}${address}${params}`,
          "get",
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
          return a.isSpent ? 1 : -1;
        }
        return 1;
      });

      return result;
    } catch (error) {
      logger.error(`Problem while building Transaction History download. Cause: ${error}`);
    }
  }

  /**
   * Fetch the richest addresses list
   * @param top The number of top addresses to return.
   * @returns The richest addresses reponse.
   */
  private async richestAddresses(top: number | null): Promise<IRichestAddressesResponse | undefined> {
    try {
      const params = {
        top: top ?? 100,
      };

      return await FetchHelper.json<never, IRichestAddressesResponse>(
        this.chronicleEndpoint,
        `${CHRONICLE_ENDPOINTS.richestAddresses}${FetchHelper.urlParams(params)}`,
        "get",
      );
    } catch (error) {
      const network = this.networkConfig.network;
      logger.warn(`[ChronicleService] Failed fetching rich addresses on ${network}. Cause: ${error}`);
    }
  }

  /**
   * Fetch the token distribution of the network.
   * @returns The token distribution reponse.
   */
  private async tokenDistribution(): Promise<ITokenDistributionResponse | undefined> {
    try {
      return await FetchHelper.json<never, ITokenDistributionResponse>(
        this.chronicleEndpoint,
        `${CHRONICLE_ENDPOINTS.tokenDistribution}`,
        "get",
      );
    } catch (error) {
      const network = this.networkConfig.network;
      logger.warn(`[ChronicleService] Failed fetching token distribution data on ${network}. Cause: ${error}`);
    }
  }

  /**
   * Sets up the interval for richest address/token distribution data refresh.
   */
  private setupCachePopulation() {
    logger.verbose("[ChronicleService] Cache population setup...");
    if (this.cacheTimer) {
      clearInterval(this.cacheTimer);
      this.cacheTimer = null;
    }

    const populateCache = () => {
      logger.verbose("Fetching token distribution data...");
      this.richestAddresses(RICH_ADDRESSES_N)
        .then((resp) => {
          if (!resp.error && resp.top) {
            this.richestAddressesCache = {
              top: resp.top,
              ledgerIndex: resp.ledgerIndex,
            };
          }
        })
        .catch(() => {
          logger.warn(`Failed population of richest addresses cache on ${this.networkConfig.network}`);
        });

      this.tokenDistribution()
        .then((resp) => {
          if (!resp.error && resp.distribution) {
            this.tokenDistributionCache = {
              distribution: resp.distribution,
              ledgerIndex: resp.ledgerIndex,
            };
          }
        })
        .catch(() => {
          logger.warn(`Failed population of token distribution cache on ${this.networkConfig.network}`);
        });
    };

    populateCache();
    this.cacheTimer = setInterval(() => {
      populateCache();
    }, RICH_ADDR_TOKEN_DIST_REFRESH_INTERVAL_MS);
  }
}
