import { ServiceFactory } from "../factories/serviceFactory";
import { TrytesHelper } from "../helpers/trytesHelper";
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
    private readonly _networkId: string;

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
        milestoneIndex: number;
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
     * @param networkId The network configurations.
     */
    constructor(networkId: string) {
        this._apiClient = ServiceFactory.get<ApiClient>("api-client");
        this._networkId = networkId;

        this._milestones = [];
        this._subscribers = {};
    }

    /**
     * Perform a request to subscribe to milestone events.
     * @param callback Callback called with milestones data.
     * @returns The subscription id.
     */
    public subscribe(callback: () => void): string {
        const subscriptionId = TrytesHelper.generateHash(27);
        this._subscribers[subscriptionId] = callback;

        if (!this._timerId) {
            this._timerId = setInterval(
                async () => {
                    await this.updateMilestones();
                },
                30000);
            setTimeout(
                async () => {
                    await this.updateMilestones();
                },
                0);
        }

        return subscriptionId;
    }

    /**
     * Perform a request to unsubscribe to milestone events.
     * @param subscriptionId The subscription id.
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
        milestoneIndex: number;
    }[] {
        return this._milestones;
    }

    /**
     * Update the milestones from the API.
     */
    private async updateMilestones(): Promise<void> {
        try {
            const response = await this._apiClient.milestonesGet({
                network: this._networkId
            });

            if (!response.error) {
                this._milestones = response.milestones ?? [];

                for (const sub in this._subscribers) {
                    this._subscribers[sub]();
                }
            }
        } catch { }
    }
}
