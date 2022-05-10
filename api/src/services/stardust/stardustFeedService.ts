import { messageIdFromMilestonePayload, SingleNodeClient } from "@iota/iota.js-stardust";
import type { IMqttClient } from "@iota/mqtt.js-stardust";
import { ServiceFactory } from "../../factories/serviceFactory";
import { IFeedService } from "../../models/services/IFeedService";

/**
 * Class to handle Stardust Protocol Feed service.
 */
export class StardustFeedService implements IFeedService {
    /**
     * Mqtt service for data.
     */
    private readonly _mqttClient: IMqttClient;

    /**
     * The endpoint for performing communications.
     */
    private readonly _endpoint: string;

    /**
     * The user for performing communications.
     */
    private readonly _user?: string;

    /**
     * The password for performing communications.
     */
    private readonly _password?: string;

    /**
     * Create a new instance of StardustItemsService.
     * @param networkId The network id.
     * @param endpoint The endpoint for the api.
     * @param user The user for the api.
     * @param password The password for the api.
     */
    constructor(networkId: string, endpoint: string, user?: string, password?: string) {
        this._mqttClient = ServiceFactory.get<IMqttClient>(`mqtt-${networkId}`);
        this._endpoint = endpoint;
        this._user = user;
        this._password = password;

        this._mqttClient.statusChanged(data => console.log("Stardust Mqtt Status", data));
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
            try {
                const apiClient = new SingleNodeClient(this._endpoint, {
                    userName: this._user,
                    password: this._password
                });
                const milestonePayload = await apiClient.milestoneByIndex(message.index);
                const messageId = messageIdFromMilestonePayload(2, milestonePayload);

                callback(message.index, messageId, message.timestamp * 1000);
            } catch (err) {
                console.error(err);
            }
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
