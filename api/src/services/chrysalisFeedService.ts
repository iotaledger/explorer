import { IMqttClient } from "@iota/iota2.js";
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
     * Create a new instance of OgFeedService.
     * @param networkId The network id.
     */
    constructor(networkId: string) {
        this._mqttClient = ServiceFactory.get<IMqttClient>(`mqtt-${networkId}`);

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
    public subscribeMilestones(callback: (milestone: number, hash: string) => void): string {
        return this._mqttClient.milestonesLatest((topic, message) => {
            callback(message.milestoneIndex, message.milestoneId);
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
