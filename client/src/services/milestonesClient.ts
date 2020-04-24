import { ServiceFactory } from "../factories/serviceFactory";
import { TrytesHelper } from "../helpers/trytesHelper";
import { IClientNetworkConfiguration } from "../models/config/IClientNetworkConfiguration";
import { ApiClient } from "./apiClient";

/**
 * Class to handle api communications.
 */
export class MilestonesClient {
    /**
     * API client.
     */
    private readonly _apiClient: ApiClient;

    /**
     * Network configuration.
     */
    private readonly _config: IClientNetworkConfiguration;

    /**
     * The latest milestones.
     */
    private _milestones: {
        /**
         * The tx hash.
         */
        hash: string;
        /**
         * The tx value.
         */
        milestoneIndex: number
    }[];

    /**
     * The timer id.
     */
    private _timerId?: NodeJS.Timer;

    /**
     * The subscribers.
     */
    private readonly _subscribers: { [id: string]: () => void };

    /**
     * Create a new instance of MilestonesClient.
     * @param networkConfiguration The network configurations.
     */
    constructor(networkConfiguration: IClientNetworkConfiguration) {
        this._apiClient = ServiceFactory.get<ApiClient>("api-client");
        this._config = networkConfiguration;

        this._milestones = [];
        this._subscribers = {};
    }

    /**
     * Perform a request to subscribe to milestone events.
     * @param complete The subscription completed.
     * @param callback Callback called with milestones data.
     * @returns The response from the request.
     */
    public subscribe(complete: (subscriptionId?: string) => void, callback: () => void): void {
        const subscriptionId = TrytesHelper.generateHash(27);

        this._subscribers[subscriptionId] = callback;

        if (this._timerId) {
            complete(subscriptionId);
        } else {
            this._timerId = setInterval(
                async () => {
                    await this.updateMilestones();
                },
                60000);
            setTimeout(
                async () => {
                    await this.updateMilestones();
                },
                0);
        }
    }

    /**
     * Perform a request to unsubscribe to milestone events.
     * @param subscriptionId The subscription id.
     * @returns The response from the request.
     */
    public unsubscribe(subscriptionId: string): void {
        delete this._subscribers[subscriptionId];

        if (this._timerId && Object.keys(this._subscribers).length === 0) {
            clearInterval(this._timerId);
            this._timerId = undefined;
        }
    }

    /**
     * Get the milestone indexes.
     * @returns The trytes.
     */
    public getMilestones(): {
        /**
         * The tx hash.
         */
        hash: string;
        /**
         * The milestone index.
         */
        milestoneIndex: number
    }[] {
        return this._milestones;
    }

    /**
     * Update the milestones from the API.
     */
    private async updateMilestones(): Promise<void> {
        try {
            const response = await this._apiClient.getMilestones({
                network: this._config.network
            });

            if (response.success) {
                this._milestones = response.milestones || [];

                for (const sub in this._subscribers) {
                    this._subscribers[sub]();
                }
            }
        } catch { }
    }
}
