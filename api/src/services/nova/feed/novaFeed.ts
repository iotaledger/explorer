/* eslint-disable import/no-unresolved */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Block, Client, IBlockMetadata, SlotCommitment } from "@iota/sdk-nova";
import { ClassConstructor, plainToInstance } from "class-transformer";
import { ServiceFactory } from "../../../factories/serviceFactory";
import logger from "../../../logger";
import { IFeedUpdate } from "../../../models/api/nova/feed/IFeedUpdate";
import { INetwork } from "../../../models/db/INetwork";
import { NodeInfoService } from "../nodeInfoService";

/**
 * Wrapper class around Nova MqttClient.
 * Streaming blocks from mqtt (upstream) to explorer-client connections (downstream).
 */
export class NovaFeed {
    /**
     * The block feed subscribers (downstream).
     */
    protected readonly blockSubscribers: {
        [id: string]: (data: IFeedUpdate) => Promise<void>;
    };

    /**
     * Mqtt service for data (upstream).
     */
    private _mqttClient: Client;

    /**
     * The network in context.
     */
    private readonly networkId: string;

    /**
     * Creates a new instance of NovaFeed.
     * @param network The network config.
     */
    constructor(network: INetwork) {
        logger.debug("[NovaFeed] Constructing a Nova Feed");
        this.blockSubscribers = {};
        this.networkId = network.network;

        // eslint-disable-next-line no-void
        void Client.create({
            nodes: [network.provider],
            brokerOptions: { useWs: true },
        }).then((_mqttClient) => {
            this._mqttClient = _mqttClient;
            const nodeInfoService = ServiceFactory.get<NodeInfoService>(`node-info-${this.networkId}`);
            if (this._mqttClient && nodeInfoService) {
                this.connect();
            } else {
                throw new Error(`Failed to build novaFeed instance for ${this.networkId}`);
            }
        });
    }

    /**
     * Subscribe to the blocks nova feed.
     * @param id The id of the subscriber.
     * @param callback The callback to call with data for the event.
     */
    public async subscribeBlocks(id: string, callback: (data: IFeedUpdate) => Promise<void>): Promise<void> {
        this.blockSubscribers[id] = callback;
    }

    /**
     * Unsubscribe from the blocks feed.
     * @param subscriptionId The id to unsubscribe.
     */
    public unsubscribeBlocks(subscriptionId: string): void {
        logger.debug(`[NovaFeed] Removing subscriber ${subscriptionId} from blocks (${this.networkId})`);
        delete this.blockSubscribers[subscriptionId];
    }

    /**
     * Connects the callbacks for upstream data.
     */
    private connect() {
        logger.info("[NovaFeed] Connecting upstream feed!");
        // eslint-disable-next-line no-void
        void this._mqttClient.listenMqtt(["blocks"], async (_, message) => {
            try {
                const block: Block = this.parseMqttPayloadMessage(Block, message);
                const blockId = await this._mqttClient.blockId(block);
                const update: Partial<IFeedUpdate> = {
                    blockUpdate: {
                        blockId,
                        block,
                    },
                };

                // eslint-disable-next-line no-void
                void this.broadcastBlock(update);
            } catch {
                logger.error("[NovaFeed]: Failed broadcasting block downstream.");
            }
        });

        // eslint-disable-next-line no-void
        void this._mqttClient.listenMqtt(["block-metadata/accepted", "block-metadata/confirmed"], async (_, message) => {
            try {
                const deserializedMessage: { topic: string; payload: string } = JSON.parse(message);
                const blockMetadataUpdate: IBlockMetadata = JSON.parse(deserializedMessage.payload);

                const update: Partial<IFeedUpdate> = {
                    blockMetadataUpdate,
                };

                // eslint-disable-next-line no-void
                void this.broadcastBlock(update);
            } catch {
                logger.error("[NovaFeed]: Failed broadcasting block-metadata downstream.");
            }
        });

        // eslint-disable-next-line no-void
        void this._mqttClient.listenMqtt(["commitments/finalized"], async (_, message) => {
            try {
                const deserializedMessage: { topic: string; payload: string } = JSON.parse(message);
                const slotCommitment: SlotCommitment = JSON.parse(deserializedMessage.payload);
                const slotFinalized = slotCommitment.slot;

                const update: Partial<IFeedUpdate> = { slotFinalized };

                // eslint-disable-next-line no-void
                void this.broadcastBlock(update);
            } catch {
                logger.error("[NovaFeed]: Failed broadcasting finalized slot downstream.");
            }
        });
    }

    private parseMqttPayloadMessage<T>(cls: ClassConstructor<T>, serializedMessage: string): T {
        try {
            const message: { topic: string; payload: string } = JSON.parse(serializedMessage);
            const payload: T = plainToInstance<T, Record<string, unknown>>(cls, JSON.parse(message.payload) as Record<string, unknown>);

            return payload;
        } catch (error) {
            logger.warn(`[NovaFeed] Failed to parse mqtt payload. ${error}`);
        }
    }

    /**
     * Pushes block data to subscribers (downstream).
     * @param payload The data payload (without subscriptionId).
     */
    private async broadcastBlock(payload: Partial<Record<string, unknown>>) {
        for (const subscriptionId in this.blockSubscribers) {
            try {
                logger.debug(`[NovaFeed] Broadcasting block to subscriber ${subscriptionId}`);
                // push data through callback
                await this.blockSubscribers[subscriptionId]({
                    ...payload,
                    subscriptionId,
                });
            } catch (error) {
                logger.warn(`[NovaFeed] Failed to send callback to block subscribers for ${subscriptionId}. Cause: ${error}`);
            }
        }
    }
}
