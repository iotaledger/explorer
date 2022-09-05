import { Blake2b } from "@iota/crypto.js-stardust";
import { BASIC_OUTPUT_TYPE, deserializeBlock, milestoneIdFromMilestonePayload, MILESTONE_PAYLOAD_TYPE, TAGGED_DATA_PAYLOAD_TYPE, TRANSACTION_PAYLOAD_TYPE } from "@iota/iota.js-stardust";
import { Converter, ReadStream } from "@iota/util.js-stardust";
import { TrytesHelper } from "../../helpers/trytesHelper";
import { IFeedSubscribeRequest } from "../../models/api/IFeedSubscribeRequest";
import { IFeedSubscribeResponse } from "../../models/api/IFeedSubscribeResponse";
import { IFeedSubscriptionMessage } from "../../models/api/IFeedSubscriptionMessage";
import { IFeedUnsubscribeRequest } from "../../models/api/IFeedUnsubscribeRequest";
import { IFeedItem } from "../../models/feed/IFeedItem";
import { IFeedItemMetadata } from "../../models/feed/IFeedItemMetadata";
import { FeedClient } from "../feedClient";

/**
 * Class to handle api communications.
 */
export class StardustFeedClient extends FeedClient {
    /**
     * Perform a request to subscribe to transactions events.
     * @param callback Callback called with transactions data.
     * @returns The subscription id.
     */
    public subscribe(callback: (newItems: IFeedItem[], metaData: { [id: string]: IFeedItemMetadata }) => void): string {
        const subscriptionId = TrytesHelper.generateHash(27);
        this._subscribers[subscriptionId] = callback;

        try {
            if (!this._subscriptionId) {
                const subscribeRequest: IFeedSubscribeRequest = {
                    network: this._networkId
                };

                this._socket.emit("subscribe", subscribeRequest);
                this._socket.on("subscribe", (subscribeResponse: IFeedSubscribeResponse) => {
                    if (!subscribeResponse.error) {
                        this._subscriptionId = subscribeResponse.subscriptionId;
                    }
                });
                this._socket.on("transactions", async (subscriptionMessage: IFeedSubscriptionMessage) => {
                    if (subscriptionMessage.subscriptionId === this._subscriptionId) {
                        if (subscriptionMessage.itemsMetadata) {
                            for (const metadataId in subscriptionMessage.itemsMetadata) {
                                const existing = this._items.find(c => c.id === metadataId);
                                if (existing) {
                                    existing.metaData = {
                                        ...existing.metaData,
                                        ...subscriptionMessage.itemsMetadata[metadataId]
                                    };
                                }
                            }
                        }

                        const filteredNewItems = subscriptionMessage.items
                            .map(item => this.convertItem(item))
                            .filter(nh => !this._existingIds.includes(nh.id));

                        if (filteredNewItems.length > 0) {
                            this._items = filteredNewItems.slice().concat(this._items);

                            let removeItems: IFeedItem[] = [];

                            const transactionPayload = this._items.filter(t => t.payloadType === "Transaction");
                            const transactionPayloadToRemoveCount =
                                transactionPayload.length - FeedClient.MIN_ITEMS_PER_TYPE;
                            if (transactionPayloadToRemoveCount > 0) {
                                removeItems =
                                    removeItems.concat(transactionPayload.slice(-transactionPayloadToRemoveCount));
                            }
                            const dataPayload = this._items.filter(t => t.payloadType === "Data");
                            const dataPayloadToRemoveCount = dataPayload.length - FeedClient.MIN_ITEMS_PER_TYPE;
                            if (dataPayloadToRemoveCount > 0) {
                                removeItems = removeItems.concat(dataPayload.slice(-dataPayloadToRemoveCount));
                            }
                            const msPayload = this._items.filter(t => t.payloadType === "MS");
                            const msPayloadToRemoveCount = msPayload.length - FeedClient.MIN_ITEMS_PER_TYPE;
                            if (msPayloadToRemoveCount > 0) {
                                removeItems = removeItems.concat(msPayload.slice(-msPayloadToRemoveCount));
                            }
                            const nonePayload = this._items.filter(t => t.payloadType === "None");
                            const nonePayloadToRemoveCount = nonePayload.length - FeedClient.MIN_ITEMS_PER_TYPE;
                            if (nonePayloadToRemoveCount > 0) {
                                removeItems = removeItems.concat(nonePayload.slice(-nonePayloadToRemoveCount));
                            }

                            this._items = this._items.filter(t => !removeItems.includes(t));

                            this._existingIds = this._items.map(t => t.id);
                        }

                        for (const sub in this._subscribers) {
                            this._subscribers[sub](filteredNewItems, subscriptionMessage.itemsMetadata);
                        }
                    }
                });
            }
        } catch { }

        return subscriptionId;
    }

    /**
     * Perform a request to unsubscribe to transactions events.
     * @param subscriptionId The subscription id.
     */
    public unsubscribe(subscriptionId: string): void {
        try {
            delete this._subscribers[subscriptionId];

            if (this._subscriptionId && Object.keys(this._subscribers).length === 0) {
                const unsubscribeRequest: IFeedUnsubscribeRequest = {
                    network: this._networkId,
                    subscriptionId: this._subscriptionId
                };
                this._socket.emit("unsubscribe", unsubscribeRequest);
                this._socket.on("unsubscribe", () => { });
            }
        } catch {
        } finally {
            this._subscriptionId = undefined;
        }
    }

    /**
     * Get the items.
     * @returns The item details.
     */
    public getItems(): IFeedItem[] {
        return this._items.slice();
    }

    /**
     * Convert the feed item into real data.
     * @param item The item source.
     * @returns The feed item.
     */
    private convertItem(item: string): IFeedItem {
        const bytes = Converter.hexToBytes(item);
        const blockId = Converter.bytesToHex(Blake2b.sum256(bytes));

        let value;
        let payloadType: "Transaction" | "Data" | "MS" | "None" = "None";
        const properties: { [key: string]: unknown } = {};
        let block;

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
                payloadType = "MS";
                properties.index = block.payload.index;
                properties.timestamp = block.payload.timestamp;
                properties.milestoneId = milestoneIdFromMilestonePayload(block.payload);
            } else if (block.payload?.type === TAGGED_DATA_PAYLOAD_TYPE) {
                payloadType = "Data";
                properties.Index = block.payload.tag;
            }
        } catch (err) {
            console.error(err);
        }

        return {
            id: blockId,
            value,
            parents: block?.parents ?? [],
            properties,
            payloadType
        };
    }
}

