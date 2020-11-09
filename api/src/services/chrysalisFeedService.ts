import { ServiceFactory } from "../factories/serviceFactory";
import { IFeedService } from "../models/services/IFeedService";
import { MqttService } from "./mqttService";

/**
 * Class to handle Chrysalis Protocol Feed service.
 */
export class ChrysalisFeedService implements IFeedService {
    /**
     * Mqtt service for data.
     */
    private readonly _mqttService: MqttService;

    /**
     * Create a new instance of OgFeedService.
     * @param networkId The network id.
     */
    constructor(networkId: string) {
        this._mqttService = ServiceFactory.get<MqttService>(`mqtt-${networkId}`);
    }

    /**
     * Connect the service.
     */
    public connect(): void {
        this._mqttService.connect();
    }

    /**
     * Get milestones from the feed.
     * @param callback The callback for new milestones.
     * @returns The subscription id.
     */
    public subscribeMilestones(callback: (milestone: number, hash: string) => void): string {
        return this._mqttService.subscribe("milestones/latest", async (evnt, message) => {
            callback(message.milestoneIndex, message.milestoneId);
        });
    }

    /**
     * Unsubscribe from subscription.
     * @param subscriptionId The subscription id.
     */
    public unsubscribe(subscriptionId): void {
        this._mqttService.unsubscribe(subscriptionId);
    }
}
