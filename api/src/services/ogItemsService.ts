import { ServiceFactory } from "../factories/serviceFactory";
import { ISn } from "../models/zmq/ISn";
import { ITxTrytes } from "../models/zmq/ITxTrytes";
import { ItemServiceBase } from "./itemServiceBase";
import { ZmqService } from "./zmqService";

/**
 * Class to handle transactions service.
 */
export class OgItemsService extends ItemServiceBase {
    /**
     * The network configuration.
     */
    private readonly _networkId: string;

    /**
     * The zmq service.
     */
    private _zmqService: ZmqService;

    /**
     * Item subscription id.
     */
    private _itemSubscriptionId: string;

    /**
     * Confirmed subscription id.
     */
    private _confirmedSubscriptionId: string;

    /**
     * Create a new instance of OgItemsService.
     * @param networkId The network configuration.
     */
    constructor(networkId: string) {
        super();

        this._networkId = networkId;
    }

    /**
     * Initialise the service.
     */
    public init(): void {
        super.init();
        this._zmqService = ServiceFactory.get<ZmqService>(`zmq-${this._networkId}`);
        this.startSubscription();
    }

    /**
     * Start the subscriptions.
     */
    protected startSubscription(): void {
        super.startSubscription();

        this._itemSubscriptionId = this._zmqService.subscribe(
            "trytes", async (evnt: string, message: ITxTrytes) => {
                this._totalItems++;

                this._items.push(message.trytes);
            });

        this._confirmedSubscriptionId = this._zmqService.subscribe(
            "sn", async (evnt: string, message: ISn) => {
                if (!this._confirmedIds.includes(message.transaction)) {
                    this._totalConfirmed++;
                    this._confirmedIds.push(message.transaction);
                }
            });
    }

    /**
     * Stop the subscriptions.
     */
    protected stopSubscription(): void {
        super.stopSubscription();

        if (this._itemSubscriptionId) {
            this._zmqService.unsubscribe(this._itemSubscriptionId);
            this._itemSubscriptionId = undefined;
        }
        if (this._confirmedSubscriptionId) {
            this._zmqService.unsubscribe(this._confirmedSubscriptionId);
            this._confirmedSubscriptionId = undefined;
        }
    }
}
