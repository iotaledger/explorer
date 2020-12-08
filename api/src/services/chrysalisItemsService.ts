import { Converter, IMessageMetadata, IMqttClient } from "@iota/iota2.js";
import { ServiceFactory } from "../factories/serviceFactory";
import { ItemServiceBase } from "./itemServiceBase";

/**
 * Class to handle messages service.
 */
export class ChrysalisItemsService extends ItemServiceBase {
    /**
     * The network configuration.
     */
    private readonly _networkId: string;

    /**
     * The mqtt client.
     */
    private _mqttClient: IMqttClient;

    /**
     * Item subscription id.
     */
    private _itemSubscriptionId: string;

    /**
     * Confirmed subscription id.
     */
    private _confirmedSubscriptionId: string;

    /**
     * Create a new instance of MessagesService.
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

        this._mqttClient = ServiceFactory.get<IMqttClient>(`mqtt-${this._networkId}`);

        this.startSubscription();
    }

    /**
     * Start the subscriptions.
     */
    protected startSubscription(): void {
        super.startSubscription();

        this._itemSubscriptionId = this._mqttClient.messagesRaw(
            (topic: string, message: Uint8Array) => {
                this._totalItems++;

                this._items.push(Converter.bytesToHex(message));
            });

        this._confirmedSubscriptionId = this._mqttClient.messagesMetadata(
            (topic: string, message: IMessageMetadata) => {
                if ((message.referencedByMilestoneIndex || message.milestoneIndex) &&
                    !this._confirmedIds.includes(message.messageId)) {
                    this._totalConfirmed++;
                    this._confirmedIds.push(message.messageId);
                }
            });
    }

    /**
     * Stop the subscriptions.
     */
    protected stopSubscription(): void {
        super.stopSubscription();

        if (this._itemSubscriptionId) {
            this._mqttClient.unsubscribe(this._itemSubscriptionId);
            this._itemSubscriptionId = undefined;
        }
        if (this._confirmedSubscriptionId) {
            this._mqttClient.unsubscribe(this._confirmedSubscriptionId);
            this._confirmedSubscriptionId = undefined;
        }
    }
}
