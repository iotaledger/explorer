import { Blake2b } from "@iota/crypto.js-stardust";
import {
    BASIC_OUTPUT_TYPE,
    deserializeBlock,
    IBlock,
    milestoneIdFromMilestonePayload,
    MILESTONE_PAYLOAD_TYPE,
    TAGGED_DATA_PAYLOAD_TYPE,
    TRANSACTION_PAYLOAD_TYPE
} from "@iota/iota.js-stardust";
import { Converter, ReadStream } from "@iota/util.js-stardust";
import { io, Socket } from "socket.io-client";
import { ServiceFactory } from "../../factories/serviceFactory";
import { IFeedSubscribeResponse } from "../../models/api/IFeedSubscribeResponse";
import { IFeedUnsubscribeRequest } from "../../models/api/IFeedUnsubscribeRequest";
import { INetworkBoundGetRequest } from "../../models/api/INetworkBoundGetRequest";
import { IFeedBlockData } from "../../models/api/stardust/feed/IFeedBlockData";
import { IFeedBlockMetadata } from "../../models/api/stardust/feed/IFeedBlockMetadata";
import { IFeedUpdate } from "../../models/api/stardust/feed/IFeedUpdate";
import { INetwork } from "../../models/config/INetwork";
import { NetworkService } from "../networkService";

const CACHE_TRIM_INTERVAL_MS = 10000;
const MAX_BLOCKS_CACHE_SIZE = 100;
const MAX_MILESTONES_CACHE_SIZE = 25;

export class StardustFeedClient {
    /**
     * Network configuration.
     */
    protected readonly _networkConfig?: INetwork;

    /**
     * Socket endpoint
     */
    protected readonly endpoint: string;

    /**
     * The web socket to communicate on.
     */
    private socket: Socket | null = null;

    /**
     * The subscription id.
     */
    private subscriptionId?: string;

    /**
     * The latest blocks data map.
     */
    private readonly latestBlocks: Map<string, IFeedBlockData>;

    /**
     * The latest milestones data map.
     */
    private readonly latestMilestones: Map<string, IFeedBlockData>;

    /**
     * The cache maps trim job timer.
     */
    private cacheTrimTimer: NodeJS.Timer | null = null;

    /**
     * Create a new instance of TransactionsClient.
     * @param endpoint The endpoint for the api.
     * @param networkId The network configurations.
     */
    constructor(endpoint: string, networkId: string) {
        this.latestBlocks = new Map();
        this.latestMilestones = new Map();
        this.endpoint = endpoint;
        const networkService = ServiceFactory.get<NetworkService>("network");
        const theNetworkConfig = networkService.get(networkId);

        if (!theNetworkConfig) {
            console.error("[FeedClient] Couldn't initialize client for network", networkId);
        } else {
            this._networkConfig = theNetworkConfig;
        }

        this.setupCacheTrimJob();
    }

    public subscribe(
        onBlockDataCallback?: (blockData: IFeedBlockData) => void,
        onMetadataUpdatedCallback?: (metadataUpdate: { [id: string]: IFeedBlockMetadata }) => void
    ) {
        this.socket = io(this.endpoint, { upgrade: true, transports: ["websocket"] });

        // If reconnect fails then also try polling mode.
        this.socket.on("reconnect_attempt", () => {
            if (this.socket) {
                this.socket.io.opts.transports = ["polling", "websocket"];
            }
        });

        try {
            if (!this.subscriptionId && this._networkConfig?.network && this.socket) {
                const subscribeRequest: INetworkBoundGetRequest = {
                    network: this._networkConfig.network
                };

                this.socket.emit("subscribe", subscribeRequest);

                this.socket.on("subscribe", (subscribeResponse: IFeedSubscribeResponse) => {
                    if (!subscribeResponse.error) {
                        this.subscriptionId = subscribeResponse.subscriptionId;
                    } else {
                        console.log(
                            "Failed subscribing to feed",
                            this._networkConfig?.network,
                            subscribeResponse.error
                        );
                    }
                });

                this.socket.on("block", async (update: IFeedUpdate) => {
                    if (update.subscriptionId === this.subscriptionId) {
                        if (update.blockMetadata) {
                            const existingBlockData = this.latestBlocks.get(update.blockMetadata?.blockId) ?? null;
                            if (existingBlockData) {
                                existingBlockData.metaData = {
                                    ...existingBlockData.metaData,
                                    ...update.blockMetadata.metadata
                                };

                                onMetadataUpdatedCallback?.(
                                    { [existingBlockData.blockId]: existingBlockData.metaData }
                                );
                            }
                        }

                        if (update.block) {
                            const block: IFeedBlockData = this.unmarshalBlock(update.block);

                            if (!this.latestBlocks.has(block.blockId)) {
                                this.latestBlocks.set(block.blockId, block);

                                onBlockDataCallback?.(block);
                            }

                            if (
                                block.payloadType === "Milestone" &&
                                !this.latestMilestones.has(block.blockId)
                            ) {
                                this.latestMilestones.set(block.blockId, block);
                            }
                        }
                    }
                });
            }
        } catch (error) {
            console.log("Failed subscribing to feed", this._networkConfig?.network, error);
        }
    }

    /**
     * Perform a request to unsubscribe to block feed events.
     */
    public unsubscribe(): void {
        try {
            if (this.subscriptionId && this._networkConfig?.network && this.socket) {
                const unsubscribeRequest: IFeedUnsubscribeRequest = {
                    network: this._networkConfig.network,
                    subscriptionId: this.subscriptionId
                };

                this.socket.emit("unsubscribe", unsubscribeRequest);
                this.socket.on("unsubscribe", () => { });
            }
        } catch {
            console.error("[FeedClient2] Could not unsubscribe");
        } finally {
            this.socket?.disconnect();
            this.subscriptionId = undefined;
            this.socket = null;
        }
    }

    /**
     * Deserialize the block into block data object.
     * @param serializedBlock The item source.
     * @returns The feed item.
     */
    private unmarshalBlock(serializedBlock: string): IFeedBlockData {
        const bytes = Converter.hexToBytes(serializedBlock);
        const blockId = Converter.bytesToHex(Blake2b.sum256(bytes), true);

        let value;
        let payloadType: "Transaction" | "TaggedData" | "Milestone" | "None" = "None";
        const properties: { [key: string]: unknown } = {};
        let block: IBlock | null = null;

        try {
            block = deserializeBlock(new ReadStream(bytes));

            if (block.payload?.type === TRANSACTION_PAYLOAD_TYPE) {
                payloadType = "Transaction";
                value = 0;

                for (const output of block.payload.essence.outputs) {
                    if (output.type === BASIC_OUTPUT_TYPE) {
                        value += Number(output.amount);
                    }
                }

                if (block.payload.essence.payload) {
                    properties.Index = block.payload.essence.payload.tag;
                }
            } else if (block.payload?.type === MILESTONE_PAYLOAD_TYPE) {
                payloadType = "Milestone";
                properties.index = block.payload.index;
                properties.timestamp = block.payload.timestamp;
                properties.milestoneId = milestoneIdFromMilestonePayload(block.payload);
            } else if (block.payload?.type === TAGGED_DATA_PAYLOAD_TYPE) {
                payloadType = "TaggedData";
                properties.Index = block.payload.tag;
            }
        } catch (err) {
            console.error(err);
        }

        return {
            blockId,
            value,
            parents: block?.parents ?? [],
            properties,
            payloadType
        };
    }

    /**
     * Setup a periodic interval to trim if the cache map is over the max limit.
     */
    private setupCacheTrimJob() {
        if (this.cacheTrimTimer) {
            clearInterval(this.cacheTrimTimer);
            this.cacheTrimTimer = null;
        }

        this.cacheTrimTimer = setInterval(() => {
            let blocksSize = this.latestBlocks.size;
            let milestonesSize = this.latestMilestones.size;

            while (blocksSize > MAX_BLOCKS_CACHE_SIZE) {
                const keyIterator = this.latestBlocks.keys();
                const oldestKey = keyIterator.next().value as string;
                this.latestBlocks.delete(oldestKey); // remove the oldest key-value pair from the Map
                blocksSize--;
            }

            while (milestonesSize > MAX_MILESTONES_CACHE_SIZE) {
                const keyIterator = this.latestMilestones.keys();
                const oldestKey = keyIterator.next().value as string;
                this.latestMilestones.delete(oldestKey); // remove the oldest key-value pair from the Map
                milestonesSize--;
            }
        }, CACHE_TRIM_INTERVAL_MS);
    }
}

