import { blockIdFromMilestonePayload, IBlockMetadata, milestoneIdFromMilestonePayload } from "@iota/iota.js-stardust";
import { IMqttClient } from "@iota/mqtt.js-stardust";
import { Converter } from "@iota/util.js-stardust";
import { ServiceFactory } from "../../../factories/serviceFactory";
import logger from "../../../logger";
import { IFeedItemMetadata } from "../../../models/api/stardust/feed/IFeedItemMetadata";
import { IFeedUpdate } from "../../../models/api/stardust/feed/IFeedUpdate";
import { ILatestMilestone } from "../../../models/api/stardust/milestone/ILatestMilestonesResponse";

const MAX_MILESTONE_LATEST = 30;

/**
 * Wrapper class around Stardust MqttClient.
 * Streaming blocks from mqtt (upstream) to explorer-client connections (downstream).
 */
export class StardustFeed {
    /**
     * The feed subscribers (downstream).
     */
    protected readonly subscribers: {
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
    private readonly blockMetadataCache: { [blockId: string]: IFeedItemMetadata };

    /**
     * Creates a new instance of StardustFeed.
     * @param networkId The network id.
     */
    constructor(networkId: string) {
        this.subscribers = {};
        this.blockMetadataCache = {};
        this._mqttClient = ServiceFactory.get<IMqttClient>(`mqtt-${networkId}`);
        this._mqttClient.statusChanged(data => logger.debug(`[Mqtt] Stardust status changed (${data.state})`));

        this.connect();
    }


    /**
     * Get the latest milestone cache state.
     * @returns The cache state.
     */
    public get getLatestMilestones() {
        return this.latestMilestonesCache;
    }

    /**
     * Subscribe to the stardust feed.
     * @param id The id of the subscriber.
     * @param callback The callback to call with data for the event.
     */
    public async subscribe(id: string, callback: (data: IFeedUpdate) => Promise<void>): Promise<void> {
        this.subscribers[id] = callback;
    }

    /**
     * Unsubscribe from the feed.
     * @param subscriptionId The id to unsubscribe.
     */
    public unsubscribe(subscriptionId: string): void {
        delete this.subscribers[subscriptionId];
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
                void this.broadcast(update);
            });

        this._mqttClient.blocksReferenced(
            (_: string, metadata: IBlockMetadata) => {
                // update cache
                this.blockMetadataCache[metadata.blockId] = {
                    ...this.blockMetadataCache[metadata.blockId],
                    milestone: metadata.milestoneIndex,
                    referenced: metadata.referencedByMilestoneIndex,
                    solid: metadata.isSolid,
                    conflicting: metadata.ledgerInclusionState === "conflicting",
                    conflictReason: metadata.conflictReason,
                    included: metadata.ledgerInclusionState === "included"
                };


                const update: Partial<IFeedUpdate> = {
                    blockMetadata: {
                        blockId: metadata.blockId,
                        metadata: this.blockMetadataCache[metadata.blockId]
                    }
                };

                // eslint-disable-next-line no-void
                void this.broadcast(update);
            });

        this._mqttClient.milestone(async (_, milestonePayload) => {
            try {
                const milestoneId = milestoneIdFromMilestonePayload(milestonePayload);
                const blockId = blockIdFromMilestonePayload(2, milestonePayload);
                const milestoneIndex = milestonePayload.index;
                const timestamp = milestonePayload.timestamp * 1000;

                this.blockMetadataCache[blockId] = {
                    ...this.blockMetadataCache[blockId],
                    milestone: milestoneIndex,
                    timestamp
                };

                // eslint-disable-next-line no-void
                void this.updateLatestMilestoneCache(blockId, milestoneIndex, milestoneId, timestamp);
            } catch (err) {
                console.error(err);
            }
        });
    }

    /**
     * Pushes data to subscribers (downstream).
     * @param payload The data payload (without subscriptionId).
     */
    private async broadcast(payload: Partial<IFeedUpdate>) {
        for (const subscriptionId in this.subscribers) {
            try {
                logger.debug(`Broadcasting to subscriber ${subscriptionId}`);
                await this.subscribers[subscriptionId]({
                    ...payload,
                    subscriptionId
                });
            } catch (error) {
                logger.warn(`[FeedClient] Failed to send callback to subscribers for ${subscriptionId}. Cause: ${error}`);
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
                timestamp: timestamp / 1000
            });

            if (this.latestMilestonesCache.length > MAX_MILESTONE_LATEST) {
                this.latestMilestonesCache.pop();
            }
        }
    }
}

