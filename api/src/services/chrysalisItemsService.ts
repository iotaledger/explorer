import { Converter, IMessageMetadata, IMqttClient } from "@iota/iota.js";
import { ServiceFactory } from "../factories/serviceFactory";
import { ItemServiceBase } from "./itemServiceBase";

/**
 * Class to handle messages service.
 */
export class ChrysalisItemsService extends ItemServiceBase {
    /**
     * The mqtt client.
     */
    private _mqttClient: IMqttClient;

    /**
     * Item subscription id.
     */
    private _itemSubscriptionId: string;

    /**
     * Metadata subscription id.
     */
    private _metadataSubscriptionId: string;

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

        this._metadataSubscriptionId = this._mqttClient.messagesMetadata(
            (topic: string, metadata: IMessageMetadata) => {
                if ((metadata.referencedByMilestoneIndex || metadata.milestoneIndex)) {
                    this._totalConfirmed++;
                }
                this._itemMetadata[metadata.messageId] = {
                    milestone: metadata.milestoneIndex,
                    referenced: metadata.referencedByMilestoneIndex,
                    solid: metadata.isSolid,
                    conflicting: metadata.ledgerInclusionState === "conflicting",
                    included: metadata.ledgerInclusionState === "included",
                    ...this._itemMetadata[metadata.messageId]
                };
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
        if (this._metadataSubscriptionId) {
            this._mqttClient.unsubscribe(this._metadataSubscriptionId);
            this._metadataSubscriptionId = undefined;
        }
    }
}
