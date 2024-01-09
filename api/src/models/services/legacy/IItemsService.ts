import { IFeedSubscriptionItem } from "../../api/legacy/IFeedSubscriptionItem";

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
  subscribe(id: string, callback: (data: IFeedSubscriptionItem) => Promise<void>): void;

  /**
   * Unsubscribe from the feed.
   * @param subscriptionId The id to unsubscribe.
   */
  unsubscribe(subscriptionId: string): void;
}
