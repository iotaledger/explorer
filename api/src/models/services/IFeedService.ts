/**
 * Interface definition for a feed service.
 */
export interface IFeedService {
    /**
     * Connect the service.
     */
    connect(): void;

    /**
     * Get milestones from the feed.
     * @param callback The callback for new milestones.
     * @returns The subscription id.
     */
    subscribeMilestones(callback: (milestone: number, id: string) => void): string;

    /**
     * Unsubscribe from subscription.
     * @param subscriptionId The subscription id.
     */
    unsubscribe(subscriptionId): void;
}
