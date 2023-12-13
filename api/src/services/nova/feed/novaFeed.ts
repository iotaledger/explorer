import { ClassConstructor, plainToInstance } from "class-transformer";
import { ServiceFactory } from "../../../factories/serviceFactory";
import logger from "../../../logger";

class Mock {

}

/**
 * Wrapper class around Nova MqttClient.
 * Streaming blocks from mqtt (upstream) to explorer-client connections (downstream).
 */
export class NovaFeed {
    /**
     * The block feed subscribers (downstream).
     */
    protected readonly blockSubscribers: {
        [id: string]: (data: Record<string, unknown>) => Promise<void>;
    };

    /**
     * Mqtt service for data (upstream).
     */
    private readonly _mqttClient: any;

    /**
     * Creates a new instance of NovaFeed.
     * @param networkId The network id.
     */
    constructor(networkId: string) {
        logger.debug("[NovaFeed] Constructing a Nova Feed");
        this.blockSubscribers = {};
        this._mqttClient = ServiceFactory.get<any>(`mqtt-${networkId}`);

        logger.debug(`[NovaFeed] Mqtt is ${JSON.stringify(this._mqttClient)}`);

        if (this._mqttClient) {
            this.connect();
        } else {
            throw new Error(`Failed to build novaFeed instance for ${networkId}`);
        }
    }

    /**
     * Connects the callbacks for upstream data.
     */
    private connect() {
        logger.info("[NovaFeed] Connecting upstream feed!");
        // eslint-disable-next-line no-void
        void this._mqttClient.listenMqtt(["blocks"], (_, message) => {
            try {
                const block: any = this.parseMqttPayloadMessage(Mock, message);
                const update: Partial<Record<string, unknown>> = {
                    block
                };

                logger.debug(`New block ${JSON.stringify(block)}`);

                // eslint-disable-next-line no-void
                void this.broadcastBlock(update);
            } catch {
                logger.error("[NovaFeed]: Failed broadcasting block downstream.");
            }
        });

        // eslint-disable-next-line no-void
        void this._mqttClient.listenMqtt(["block-metadata/referenced"], (_, message) => {
            const parsed: { topic: string; payload: string } = JSON.parse(message);
            const metadata: any = JSON.parse(parsed.payload);

            logger.debug(`New metadata ${JSON.stringify(metadata)}`);

            const currentEntry = {
                blockId: metadata.blockId,
                blockState: metadata.blockState,
                transactionState: metadata.transactionState,
                blockFailureReason: metadata.blockFailureReason,
                transactionFailureReason: metadata.transactionFailureReason
            };

            const update: Partial<Record<string, unknown>> = {
                blockMetadata: {
                    blockId: metadata.blockId,
                    metadata: currentEntry
                }
            };

            // eslint-disable-next-line no-void
            void this.broadcastBlock(update);
        });
    }

    private parseMqttPayloadMessage<T>(cls: ClassConstructor<T>, serializedMessage: string): T {
        try {
            const message: { topic: string; payload: string } = JSON.parse(serializedMessage);
            const payload: T = plainToInstance<T, Record<string, unknown>>(
                cls,
                JSON.parse(message.payload) as Record<string, unknown>
            );

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
                logger.debug(`Broadcasting block to subscriber ${subscriptionId}`);
                // push data through callback
                await this.blockSubscribers[subscriptionId]({
                    ...payload,
                    subscriptionId
                });
            } catch (error) {
                logger.warn(`[NovaFeed] Failed to send callback to block subscribers for ${subscriptionId}. Cause: ${error}`);
            }
        }
    }
}

