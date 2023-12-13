import {
    Block
} from "@iota/sdk-wasm-nova/web";
import { io, Socket } from "socket.io-client";
import { ServiceFactory } from "~/factories/serviceFactory";
import { IFeedSubscribeResponse } from "~/models/api/IFeedSubscribeResponse";
import { IFeedBlockData } from "~/models/api/nova/feed/IFeedBlockData";
import { IFeedSubscribeRequest } from "~/models/api/nova/feed/IFeedSubscribeRequest";
import { IFeedUpdate } from "~/models/api/nova/feed/IFeedUpdate";
import { INodeInfoResponse } from "~/models/api/nova/INodeInfoResponse";
import { IFeedBlockMetadata } from "~/models/api/stardust/feed/IFeedBlockMetadata";
import { IFeedUnsubscribeRequest } from "~/models/api/stardust/feed/IFeedUnsubscribeRequest";
import { INetwork } from "~/models/config/INetwork";
import { NetworkService } from "../networkService";
import { NodeInfoService } from "./nodeInfoService";

export class NovaFeedClient {
    /**
     * Network configuration.
     */
    protected readonly _networkConfig?: INetwork;

    /**
     * Network node info.
     */
    protected readonly _nodeInfo?: INodeInfoResponse;

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
        const nodeService = ServiceFactory.get<NodeInfoService>("node-info-nova");
        const nodeInfo = theNetworkConfig?.network ? nodeService.get(theNetworkConfig?.network) : null;

        if (theNetworkConfig && nodeInfo) {
            this._networkConfig = theNetworkConfig;
            this._nodeInfo = nodeInfo
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
        // TODO Support metadata update
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
            if (!this.blockSubscriptionId && this._networkConfig?.network && this.socket) {
                const subscribeRequest: IFeedSubscribeRequest = {
                    network: this._networkConfig.network,
                    feedSelect: "block"
                };

                this.socket.on("subscribe", (subscribeResponse: IFeedSubscribeResponse) => {
                    if (subscribeResponse.error) {
                        console.log(
                            "Failed subscribing to feed",
                            this._networkConfig?.network,
                            subscribeResponse.error
                        );
                    } else {
                        this.blockSubscriptionId = subscribeResponse.subscriptionId;
                    }
                });

                this.socket.on("block", async (update: IFeedUpdate) => {
                    if (update.subscriptionId === this.blockSubscriptionId) {
                        if (update.block) {
                            const block: IFeedBlockData = this.buildFeedBlockData(update.block);
                            console.log("[NovaFeedClient] New block", block);
                            onBlockDataCallback?.(block);
                        }
                    }
                });

                this.socket.emit("subscribe", subscribeRequest);
            }
        } catch (error) {
            console.log("Failed subscribing to block feed", this._networkConfig?.network, error);
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
                    feedSelect: "block"
                };

                this.socket.on("unsubscribe", () => { });
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

    /**
     * Build the block data object.
     * @param block The item source.
     * @returns The feed item.
     */
    private buildFeedBlockData(block: Block): IFeedBlockData {
        const blockId = "unknown"
        // TODO Figure out how to use Protocol parameters from SDK to build blockId
        //
        // const latestProtocolParameters = this._nodeInfo?.protocolParameters.at(-1)?.parameters ?? null
        // if (latestProtocolParameters) {
        //     console.log(latestProtocolParameters)
        //     blockId = Utils.blockId(block, latestProtocolParameters);
        // }

        return {
            blockId,
            block
        };
    }
}
