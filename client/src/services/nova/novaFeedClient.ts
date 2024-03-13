import { BlockMetadataResponse, SlotIndex } from "@iota/sdk-wasm-nova/web";
import { io, Socket } from "socket.io-client";
import { ServiceFactory } from "~/factories/serviceFactory";
import { IFeedSubscribeResponse } from "~/models/api/IFeedSubscribeResponse";
import { IFeedBlockData } from "~/models/api/nova/feed/IFeedBlockData";
import { IFeedSubscribeRequest } from "~/models/api/nova/feed/IFeedSubscribeRequest";
import { IFeedUpdate } from "~/models/api/nova/feed/IFeedUpdate";
import { IFeedUnsubscribeRequest } from "~/models/api/stardust/feed/IFeedUnsubscribeRequest";
import { INetwork } from "~/models/config/INetwork";
import { NetworkService } from "../networkService";

export class NovaFeedClient {
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
     * The subscription id for blocks feed.
     */
    private blockSubscriptionId?: string;

    /**
     * Create a new instance of StardustFeedClient.
     * @param endpoint The endpoint for the api.
     * @param networkId The network configurations.
     */
    constructor(endpoint: string, networkId: string) {
        this.endpoint = endpoint;
        const networkService = ServiceFactory.get<NetworkService>("network");
        const theNetworkConfig = networkService.get(networkId);

        if (theNetworkConfig) {
            this._networkConfig = theNetworkConfig;
        } else {
            console.error("[NovaFeedClient] Couldn't initialize client for network", networkId);
        }
    }

    /**
     * Subscribe to the feed of blocks.
     * @param onBlockDataCallback the callback for block data updates.
     */
    public subscribeBlocks(
        onBlockDataCallback?: (blockData: IFeedBlockData) => void,
        onMetadataUpdatedCallback?: (blockMetadata: BlockMetadataResponse) => void,
        onSlotFinalizedCallback?: (slotFinalized: SlotIndex) => void,
    ) {
        this.socket = io(this.endpoint, { upgrade: true, transports: ["websocket"] });

        // If reconnect fails then also try polling mode.
        this.socket.on("reconnect_attempt", () => {
            if (this.socket) {
                this.socket.io.opts.transports = ["polling", "websocket"];
            }
        });

        try {
            if (!this.blockSubscriptionId && this._networkConfig?.network && this.socket) {
                const subscribeRequest: IFeedSubscribeRequest = {
                    network: this._networkConfig.network,
                    feedSelect: "block",
                };

                this.socket.on("subscribe", (subscribeResponse: IFeedSubscribeResponse) => {
                    if (subscribeResponse.error) {
                        console.error("Failed subscribing to feed", this._networkConfig?.network, subscribeResponse.error);
                    } else {
                        this.blockSubscriptionId = subscribeResponse.subscriptionId;
                    }
                });

                this.socket.on("block", async (update: IFeedUpdate) => {
                    if (update.subscriptionId === this.blockSubscriptionId) {
                        if (update.blockUpdate) {
                            onBlockDataCallback?.(update.blockUpdate);
                        }

                        if (update.blockMetadataUpdate) {
                            onMetadataUpdatedCallback?.(update.blockMetadataUpdate);
                        }

                        if (update.slotFinalized) {
                            onSlotFinalizedCallback?.(update.slotFinalized);
                        }
                    }
                });

                this.socket.emit("subscribe", subscribeRequest);
            }
        } catch (error) {
            console.error("Failed subscribing to block feed", this._networkConfig?.network, error);
        }
    }

    /**
     * Perform a request to unsubscribe to block feed events.
     */
    public async unsubscribeBlocks(): Promise<boolean> {
        let success = false;
        try {
            if (this.blockSubscriptionId && this._networkConfig?.network && this.socket) {
                const unsubscribeRequest: IFeedUnsubscribeRequest = {
                    network: this._networkConfig.network,
                    subscriptionId: this.blockSubscriptionId,
                    feedSelect: "block",
                };

                this.socket.on("unsubscribe", () => {});
                this.socket.emit("unsubscribe", unsubscribeRequest);
                success = true;
            }
        } catch {
            success = false;
            console.error("[NovaFeedClient] Could not unsubscribe blocks");
        } finally {
            this.socket?.disconnect();
            this.blockSubscriptionId = undefined;
            this.socket = null;
        }

        return success;
    }
}
