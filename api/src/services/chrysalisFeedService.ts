import { IClient, IMqttClient, SingleNodeClient } from "@iota/iota.js";
import { ServiceFactory } from "../factories/serviceFactory";
import { IFeedService } from "../models/services/IFeedService";

/**
 * Class to handle Chrysalis Protocol Feed service.
 */
export class ChrysalisFeedService implements IFeedService {
    /**
     * Mqtt service for data.
     */
    private readonly _mqttClient: IMqttClient;

    /**
     * API Client.
     */
    private readonly _apiClient: IClient;

    /**
     * Create a new instance of OgFeedService.
     * @param networkId The network id.
     * @param provider Provider for API Endpoint.
     */
    constructor(networkId: string, provider: string) {
        this._mqttClient = ServiceFactory.get<IMqttClient>(`mqtt-${networkId}`);
        this._apiClient = new SingleNodeClient(provider);

        this._mqttClient.statusChanged(data => console.log("Status", data));
    }

    /**
     * Connect the service.
     */
    public connect(): void {
    }

    /**
     * Get milestones from the feed.
     * @param callback The callback for new milestones.
     * @returns The subscription id.
     */
    public subscribeMilestones(callback: (milestone: number, id: string, timestamp: number) => void): string {
        return this._mqttClient.milestonesLatest(async (topic, message) => {
            const ms = await this._apiClient.milestone(message.milestoneIndex);
            callback(message.milestoneIndex, ms.messageId, message.timestamp);
        });
    }

    /**
     * Unsubscribe from subscription.
     * @param subscriptionId The subscription id.
     */
    public unsubscribe(subscriptionId): void {
        this._mqttClient.unsubscribe(subscriptionId);
    }
}
