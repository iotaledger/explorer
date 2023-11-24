import { asTransactionObject } from "@iota/transaction-converter";
import { TrytesHelper } from "~helpers/trytesHelper";
import { IFeedSubscribeResponse } from "~models/api/IFeedSubscribeResponse";
import { IFeedSubscriptionMessage } from "~models/api/IFeedSubscriptionMessage";
import { IFeedUnsubscribeRequest } from "~models/api/IFeedUnsubscribeRequest";
import { INetworkBoundGetRequest } from "~models/api/INetworkBoundGetRequest";
import { IFeedItem } from "~models/feed/IFeedItem";
import { IFeedItemMetadata } from "~models/feed/IFeedItemMetadata";
import { FeedClient } from "../feedClient";

/**
 * Class to handle api communications.
 */
export class LegacyFeedClient extends FeedClient {
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
                const subscribeRequest: INetworkBoundGetRequest = {
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

                            const zero = this._items.filter(t => t.payloadType === "Transaction" && t.value === 0);
                            const zeroToRemoveCount = zero.length - FeedClient.MIN_ITEMS_PER_TYPE;
                            if (zeroToRemoveCount > 0) {
                                removeItems = removeItems.concat(zero.slice(-zeroToRemoveCount));
                            }
                            const nonZero = this._items.filter(t => t.payloadType === "Transaction" &&
                                t.value !== 0 && t.value !== undefined);
                            const nonZeroToRemoveCount = nonZero.length - FeedClient.MIN_ITEMS_PER_TYPE;
                            if (nonZeroToRemoveCount > 0) {
                                removeItems = removeItems.concat(nonZero.slice(-nonZeroToRemoveCount));
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
        const tx = asTransactionObject(item);

        return {
            id: tx.hash,
            value: tx.value,
            parents: [
                tx.trunkTransaction,
                tx.branchTransaction
            ],
            properties: {
                "Tag": tx.tag,
                "Address": tx.address,
                "Bundle": tx.bundle
            },
            payloadType: "Transaction"
        };
    }
}

