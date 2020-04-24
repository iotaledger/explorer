import { ServiceFactory } from "../factories/serviceFactory";
import { INetworkConfiguration } from "../models/configuration/INetworkConfiguration";
import { IAddress } from "../models/zmq/IAddress";
import { MilestoneStoreService } from "./milestoneStoreService";
import { ZmqService } from "./zmqService";

/**
 * Class to handle milestones service.
 */
export class MilestonesService {
    /**
     * The network configuration.
     */
    private readonly _config: INetworkConfiguration;

    /**
     * The zmq service.
     */
    private _zmqService: ZmqService;

    /**
     * The milestone store service.
     */
    private _milestoneStoreService: MilestoneStoreService;

    /**
     * Subscription ids.
     */
    private _subscriptionId: string;

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
         * The transaction hash.
         */
        hash: string;
        /**
         * The milestone index.
         */
        milestoneIndex: number;
    }[];

    /**
     * Create a new instance of MilestoneService.
     * @param networkConfiguration The network configuration.
     */
    constructor(networkConfiguration: INetworkConfiguration) {
        this._config = networkConfiguration;
    }

    /**
     * Initialise the milestones.
     */
    public async init(): Promise<void> {
        this._zmqService = ServiceFactory.get<ZmqService>(`zmq-${this._config.network}`);
        this._milestones = [];

        this._milestoneStoreService = ServiceFactory.get<MilestoneStoreService>("milestone-store");

        if (this._milestoneStoreService) {
            const store = await this._milestoneStoreService.get(this._config.network);
            if (store && store.indexes) {
                this._milestones = store.indexes;
            }
        }

        this.initNetwork();

        this.startTimer();
    }

    /**
     * Reset the services.
     */
    public async reset(): Promise<void> {
        this.stopTimer();

        this.closeNetwork();

        this.initNetwork();

        this.startTimer();
    }

    /**
     * Get the milestones for the request network.
     * @returns The milestones for the network.
     */
    public getMilestones(): {
        /**
         * The transaction hash.
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
     * Initialise network.
     */
    private initNetwork(): void {
        this._subscriptionId = this._zmqService.subscribeAddress(
            this._config.coordinatorAddress,
            async (evnt: string, message: IAddress) => {
                if (message.address === this._config.coordinatorAddress) {
                    this._lastUpdate = Date.now();

                    if (this._milestones.length === 0 ||
                        message.milestoneIndex > this._milestones[0].milestoneIndex) {
                        this._milestones.unshift({
                            hash: message.transaction,
                            milestoneIndex: message.milestoneIndex
                        });
                        this._milestones = this._milestones.slice(0, 100);

                        if (this._milestoneStoreService) {
                            try {
                                await this._milestoneStoreService.set({
                                    network: this._config.network,
                                    indexes: this._milestones
                                });
                            } catch (err) {
                                console.error(`Failed writing ${this._config.network} milestone store`, err);
                            }
                        }
                    }
                }
            });
    }

    /**
     * Closedown network.
     */
    private closeNetwork(): void {
        if (this._subscriptionId) {
            this._zmqService.unsubscribe(this._subscriptionId);
            this._subscriptionId = undefined;
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
                            this.initNetwork();
                        }
                    } catch (err) {
                        console.error(`Failed processing ${this._config.network} idle timeout`, err);
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
