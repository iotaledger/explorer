import { IMessage, IMessageMetadata, IMqttClient } from "@iota/iota2.js";
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

        this._itemSubscriptionId = this._mqttClient.messages(
            (topic: string, messageId: string, message: IMessage) => {
                this._totalItems++;

                let value = 0;
                let indexationKey = "";

                // Transaction payload
                if (message.payload?.type === 0) {
                    value = message.payload.essence.outputs.reduce((total, output) => total + output.amount, 0);

                    if (message.payload.essence.payload) {
                        indexationKey = message.payload.essence.payload.index;
                    }
                } else if (message.payload?.type === 2) {
                    indexationKey = message.payload?.index;
                }

                this._items.push({
                    id: messageId,
                    value,
                    parent1: message.parent1MessageId,
                    parent2: message.parent2MessageId,
                    indexationKey,
                    payloadType: message.payload?.type
                });
            });

        this._confirmedSubscriptionId = this._mqttClient.messagesMetadata(
            (topic: string, message: IMessageMetadata) => {
                if (message.referencedByMilestoneIndex && !this._confirmedIds.includes(message.messageId)) {
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
