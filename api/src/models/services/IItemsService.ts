import { IFeedSubscriptionMessage } from "../api/og/IFeedSubscriptionMessage";

/**
 * Interface definition for an items service.
 */
export interface IItemsService {
    /**
     * Initialise the service.
     */
    init(): void;

    /**
     * Subscribe to items feed.
     * @param id The id of the subscriber.
     * @param callback The callback to call with data for the event.
     */
    subscribe(id: string, callback: (data: IFeedSubscriptionMessage) => Promise<void>): void;

    /**
     * Unsubscribe from the feed.
     * @param subscriptionId The id to unsubscribe.
     */
    unsubscribe(subscriptionId: string): void;

    /**
     * Get the current stats.
     * @returns The statistics for the network.
     */
    getStats(): {
        /**
         * The items per second.
         */
        itemsPerSecond: number;
        /**
         * The confirmed items per second.
         */
        confirmedItemsPerSecond: number;
        /**
         * The confirmed rate.
         */
        confirmationRate: number;
    };
}
