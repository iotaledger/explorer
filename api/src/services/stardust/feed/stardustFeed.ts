import { blockIdFromMilestonePayload, IBlockMetadata, milestoneIdFromMilestonePayload } from "@iota/iota.js-stardust";
import { IMqttClient } from "@iota/mqtt.js-stardust";
import { Converter } from "@iota/util.js-stardust";
import { ServiceFactory } from "../../../factories/serviceFactory";
import logger from "../../../logger";
import { IFeedItemMetadata } from "../../../models/api/stardust/feed/IFeedItemMetadata";
import { IFeedUpdate } from "../../../models/api/stardust/feed/IFeedUpdate";
import { ILatestMilestone } from "../../../models/api/stardust/milestone/ILatestMilestonesResponse";
import { NodeInfoService } from "../nodeInfoService";

const CACHE_TRIM_INTERVAL_MS = 60000;
const MAX_BLOCKS_CACHE_SIZE = 500;

const MAX_MILESTONE_LATEST = 30;

/**
 * Wrapper class around Stardust MqttClient.
 * Streaming blocks from mqtt (upstream) to explorer-client connections (downstream).
 */
export class StardustFeed {
    /**
     * The block feed subscribers (downstream).
     */
    protected readonly blockSubscribers: {
        [id: string]: (data: IFeedUpdate) => Promise<void>;
    };

    /**
     * The milestone feed subscribers (downstream).
     */
    protected readonly milestoneSubscribers: {
        [id: string]: (data: IFeedUpdate) => Promise<void>;
    };

    /**
     * Mqtt service for data (upstream).
     */
    private readonly _mqttClient: IMqttClient;

    /**
     * The latest milestones.
     */
    private readonly latestMilestonesCache: ILatestMilestone[] = [];

    /**
     * The most recent block metadata.
     */
    private readonly blockMetadataCache: Map<string, IFeedItemMetadata>;

    /**
     * The cache maps trim job timer.
     */
    private blockMetadataCacheTrimTimer: NodeJS.Timer | null = null;

    /**
     * The protocol.version for the network in context (from NodeInfo).
     */
    private readonly networkProtocolVersion: number;

    /**
     * Creates a new instance of StardustFeed.
     * @param networkId The network id.
     */
    constructor(networkId: string) {
        this.blockSubscribers = {};
        this.milestoneSubscribers = {};
        this.blockMetadataCache = new Map();
        this._mqttClient = ServiceFactory.get<IMqttClient>(`mqtt-${networkId}`);
        const nodeInfoService = ServiceFactory.get<NodeInfoService>(`node-info-${networkId}`);

        if (this._mqttClient && nodeInfoService) {
            this._mqttClient.statusChanged(data => logger.debug(`[Mqtt] Stardust status changed (${data.state})`));
            const nodeInfo = nodeInfoService.getNodeInfo();
            this.networkProtocolVersion = nodeInfo.protocolVersion;

            this.setupCacheTrimJob();
            this.connect();
        } else {
            throw new Error(`Failed to build stardustFeed instance for ${networkId}`);
        }
    }


    /**
     * Get the latest milestone cache state.
     * @returns The cache state.
     */
    public get getLatestMilestones() {
        return this.latestMilestonesCache;
    }

    /**
     * Subscribe to the blocks stardust feed.
     * @param id The id of the subscriber.
     * @param callback The callback to call with data for the event.
     */
    public async subscribeBlocks(id: string, callback: (data: IFeedUpdate) => Promise<void>): Promise<void> {
        this.blockSubscribers[id] = callback;
    }

    /**
     * Subscribe to the blocks stardust feed.
     * @param id The id of the subscriber.
     * @param callback The callback to call with data for the event.
     */
    public async subscribeMilestones(id: string, callback: (data: IFeedUpdate) => Promise<void>): Promise<void> {
        this.milestoneSubscribers[id] = callback;
    }

    /**
     * Unsubscribe from the blocks feed.
     * @param subscriptionId The id to unsubscribe.
     */
    public unsubscribeBlocks(subscriptionId: string): void {
        delete this.blockSubscribers[subscriptionId];
    }

    /**
     * Unsubscribe from the milestones feed.
     * @param subscriptionId The id to unsubscribe.
     */
    public unsubscribeMilestones(subscriptionId: string): void {
        delete this.milestoneSubscribers[subscriptionId];
    }

    /**
     * Connects the callbacks for upstream data.
     */
    private connect() {
        this._mqttClient.blocksRaw(
            (_: string, block: Uint8Array) => {
                const serializedBlock = Converter.bytesToHex(block);

                const update: Partial<IFeedUpdate> = {
                    block: serializedBlock
                };

                // eslint-disable-next-line no-void
                void this.broadcastBlock(update);
            });

        this._mqttClient.blocksReferenced(
            (_: string, metadata: IBlockMetadata) => {
                // update cache
                let currentEntry = this.blockMetadataCache.get(metadata.blockId) ?? null;
                currentEntry = !currentEntry ? {
                    milestone: metadata.milestoneIndex,
                    referenced: metadata.referencedByMilestoneIndex,
                    solid: metadata.isSolid,
                    conflicting: metadata.ledgerInclusionState === "conflicting",
                    conflictReason: metadata.conflictReason,
                    included: metadata.ledgerInclusionState === "included"
                } : {
                    ...currentEntry,
                    milestone: metadata.milestoneIndex,
                    referenced: metadata.referencedByMilestoneIndex,
                    solid: metadata.isSolid,
                    conflicting: metadata.ledgerInclusionState === "conflicting",
                    conflictReason: metadata.conflictReason,
                    included: metadata.ledgerInclusionState === "included"
                };

                this.blockMetadataCache.set(metadata.blockId, currentEntry);

                const update: Partial<IFeedUpdate> = {
                    blockMetadata: {
                        blockId: metadata.blockId,
                        metadata: currentEntry
                    }
                };

                // eslint-disable-next-line no-void
                void this.broadcastBlock(update);
            });

        this._mqttClient.milestone(async (_, milestonePayload) => {
            try {
                const milestoneId = milestoneIdFromMilestonePayload(milestonePayload);
                const blockId = blockIdFromMilestonePayload(this.networkProtocolVersion, milestonePayload);
                const milestoneIndex = milestonePayload.index;
                const timestamp = milestonePayload.timestamp;

                // eslint-disable-next-line no-void
                void this.updateLatestMilestoneCache(blockId, milestoneIndex, milestoneId, timestamp);

                const update: Partial<IFeedUpdate> = {
                    milestone: {
                        blockId,
                        milestoneId,
                        milestoneIndex,
                        timestamp,
                        payload: milestonePayload
                    }
                };

                // eslint-disable-next-line no-void
                void this.broadcastMilestone(update);
            } catch (err) {
                logger.error(`[FeedClient] Mqtt milestone callback failed: ${err}`);
            }
        });
    }

    /**
     * Pushes block data to subscribers (downstream).
     * @param payload The data payload (without subscriptionId).
     */
    private async broadcastBlock(payload: Partial<IFeedUpdate>) {
        for (const subscriptionId in this.blockSubscribers) {
            try {
                logger.debug(`Broadcasting block to subscriber ${subscriptionId}`);
                // push data through callback
                await this.blockSubscribers[subscriptionId]({
                    ...payload,
                    subscriptionId
                });
            } catch (error) {
                logger.warn(`[FeedClient] Failed to send callback to block subscribers for ${subscriptionId}. Cause: ${error}`);
            }
        }
    }

    /**
     * Pushes milestone data to subscribers (downstream).
     * @param payload The data payload (without subscriptionId).
     */
    private async broadcastMilestone(payload: Partial<IFeedUpdate>) {
        for (const subscriptionId in this.milestoneSubscribers) {
            try {
                logger.debug(`Broadcasting milestone to subscriber ${subscriptionId}`);
                // push data through callback
                await this.milestoneSubscribers[subscriptionId]({
                    ...payload,
                    subscriptionId
                });
            } catch (error) {
                logger.warn(`[FeedClient] Failed to send callback to milestone subscribers for ${subscriptionId}. Cause: ${error}`);
            }
        }
    }

    /**
     * Updates the milestone cache.
     * @param blockId The block id.
     * @param milestoneIndex The milestone index.
     * @param milestoneId The milestone id.
     * @param timestamp The milestone timestamp.
     */
    private async updateLatestMilestoneCache(
        blockId: string, milestoneIndex: number, milestoneId: string, timestamp: number
    ): Promise<void> {
        if (!this.latestMilestonesCache.map(ms => ms.blockId).includes(blockId)) {
            this.latestMilestonesCache.unshift({
                blockId,
                milestoneId,
                index: milestoneIndex,
                timestamp
            });

            if (this.latestMilestonesCache.length > MAX_MILESTONE_LATEST) {
                this.latestMilestonesCache.pop();
            }
        }
    }

    /**
     * Setup a periodic interval to trim if the cache map is over the max limit.
     */
    private setupCacheTrimJob() {
        if (this.blockMetadataCacheTrimTimer) {
            clearInterval(this.blockMetadataCacheTrimTimer);
            this.blockMetadataCacheTrimTimer = null;
        }

        this.blockMetadataCacheTrimTimer = setInterval(() => {
            let cacheSize = this.blockMetadataCache.size;

            while (cacheSize > MAX_BLOCKS_CACHE_SIZE) {
                const keyIterator = this.blockMetadataCache.keys();
                const oldestKey = keyIterator.next().value as string;
                this.blockMetadataCache.delete(oldestKey); // remove the oldest key-value pair from the Map
                cacheSize--;
            }
        }, CACHE_TRIM_INTERVAL_MS);
    }
}
