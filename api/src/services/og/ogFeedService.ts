import { ServiceFactory } from "../../factories/serviceFactory";
import { IFeedService } from "../../models/services/IFeedService";
import { ZmqService } from "./zmqService";

/**
 * Class to handle Original Protocol Feed service.
 */
export class OgFeedService implements IFeedService {
    /**
     * Zmq service for data.
     */
    private readonly _zmqService: ZmqService;

    /**
     * The coordinator address.
     */
    private readonly _coordinatorAddress: string;

    /**
     * Create a new instance of OgFeedService.
     * @param networkId The network id.
     * @param coordinatorAddress The coordinator address.
     */
    constructor(networkId: string, coordinatorAddress: string) {
        this._zmqService = ServiceFactory.get<ZmqService>(`zmq-${networkId}`);
        this._coordinatorAddress = coordinatorAddress;
    }

    /**
     * Connect the service.
     */
    public connect(): void {
        this._zmqService.connect();
    }

    /**
     * Get milestones from the feed.
     * @param callback The callback for new milestones.
     * @returns The subscription id.
     */
    public subscribeMilestones(callback: (milestone: number, id: string, timestamp: number) => void): string {
        return this._zmqService.subscribeAddress(this._coordinatorAddress, async (evnt, message) => {
            if (message.address === this._coordinatorAddress) {
                callback(message.milestoneIndex, message.transaction, Date.now());
            }
        });
    }

    /**
     * Unsubscribe from subscription.
     * @param subscriptionId The subscription id.
     */
    public unsubscribe(subscriptionId): void {
        this._zmqService.unsubscribe(subscriptionId);
    }
}
