import { ServiceFactory } from "../factories/serviceFactory";
import { IMilestoneStore } from "../models/db/IMilestoneStore";
import { IFeedService } from "../models/services/IFeedService";
import { IStorageService } from "../models/services/IStorageService";

/**
 * Class to handle milestones service.
 */
export class MilestonesService {
    /**
     * The network name.
     */
    private readonly _networkId: string;

    /**
     * The feed service.
     */
    private _feedService: IFeedService;

    /**
     * The milestone store service.
     */
    private _milestoneStorageService: IStorageService<IMilestoneStore>;

    /**
     * Subscription address id.
     */
    private _subscriptionAddressId: string;

    /**
     * Last updates
     */
    private _lastUpdate: number;

    /**
     * Timer id.
     */
    private _timerId?: NodeJS.Timer;

    /**
     * Are we already updating.
     */
    private _updating: boolean;

    /**
     * The most recent milestones.
     */
    private _milestones: {
        /**
         * The id.
         */
        id: string;
        /**
         * The milestone index.
         */
        milestoneIndex: number;
        /**
         * The milestone timestamp.
         */
        timestamp: number;
    }[];

    /**
     * Create a new instance of MilestoneService.
     * @param networkId The network configuration.
     */
    constructor(networkId: string) {
        this._networkId = networkId;
    }

    /**
     * Initialise the milestones.
     */
    public async init(): Promise<void> {
        this._feedService = ServiceFactory.get<IFeedService>(`feed-${this._networkId}`);
        this._milestones = [];

        this._milestoneStorageService = ServiceFactory.get<IStorageService<IMilestoneStore>>("milestone-storage");

        if (this._milestoneStorageService) {
            const store = await this._milestoneStorageService.get(this._networkId);
            if (store?.indexes) {
                this._milestones = store.indexes;
            }
        }

        await this.initNetwork();

        this.startTimer();
    }

    /**
     * Reset the services.
     */
    public async reset(): Promise<void> {
        this.stopTimer();

        this.closeNetwork();

        await this.initNetwork();

        this.startTimer();
    }

    /**
     * Get the milestones for the request network.
     * @returns The milestones for the network.
     */
    public getMilestones(): {
        /**
         * The id.
         */
        id: string;
        /**
         * The milestone index.
         */
        milestoneIndex: number;
        /**
         * The milestone timestamp.
         */
        timestamp: number;
    }[] {
        return this._milestones;
    }

    /**
     * Initialise network.
     */
    private async initNetwork(): Promise<void> {
        this._subscriptionAddressId = this._feedService.subscribeMilestones(
            async (milestoneIndex: number, id: string, timestamp: number) => {
                this._lastUpdate = Date.now();

                if (this._milestones.findIndex(p => p.milestoneIndex === milestoneIndex) === -1) {
                    this._milestones.unshift({
                        id,
                        milestoneIndex,
                        timestamp
                    });

                    this._milestones = this._milestones.slice(0, 100);

                    if (this._milestoneStorageService) {
                        this._milestoneStorageService.set({
                            network: this._networkId,
                            indexes: this._milestones
                        }).catch(err => {
                            console.error(`Failed writing ${this._networkId} milestone store`, err);
                        });
                    }
                }
            });
    }

    /**
     * Closedown network.
     */
    private closeNetwork(): void {
        if (this._subscriptionAddressId) {
            this._feedService.unsubscribe(this._subscriptionAddressId);
            this._subscriptionAddressId = undefined;
        }
    }

    /**
     * Start the timer for idle timeout.
     */
    private startTimer(): void {
        this.stopTimer();
        this._timerId = setInterval(
            async () => {
                if (!this._updating) {
                    this._updating = true;
                    const now = Date.now();

                    try {
                        if (now - this._lastUpdate > 5 * 60 * 1000) {
                            this.closeNetwork();
                            await this.initNetwork();
                        }
                    } catch (err) {
                        console.error(`Failed processing ${this._networkId} idle timeout`, err);
                    }

                    this._updating = false;
                }
            },
            5000);
    }

    /**
     * Stop the idle timer.
     */
    private stopTimer(): void {
        if (this._timerId) {
            clearInterval(this._timerId);
            this._timerId = undefined;
        }
    }
}
