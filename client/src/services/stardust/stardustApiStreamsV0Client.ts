import { IMessage } from "@iota/iota.js-stardust";
import { Converter } from "@iota/util.js-stardust";
import { ServiceFactory } from "../../factories/serviceFactory";
import IMessageDetails from "../../models/api/stardust/IMessageDetails";
import { STARDUST } from "../../models/db/protocolVersion";
import { StardustApiClient } from "./stardustApiClient";

/**
 * Class to handle api communications to api for mam.
 */
export class StardustApiStreamsV0Client {
    /**
     * The base api client.
     */
    private readonly _apiClient: StardustApiClient;

    /**
     * The network.
     */
    private readonly _network: string;

    /**
     * Create a new instance of ApiMamClient.
     * @param network The network to use.
     */
    constructor(network: string) {
        this._apiClient = ServiceFactory.get<StardustApiClient>(`api-client-${STARDUST}`);
        this._network = network;
    }

    /**
     * Find messages by index.
     * @param indexationKey The index value.
     * @returns The messageId.
     */
    public async messagesFind(indexationKey: Uint8Array): Promise<IMessageDetails> {
        const hex = Converter.bytesToHex(indexationKey);
        const result = await this._apiClient.search({
            network: this._network,
            query: hex
        });

        return {
            index: hex,
            maxResults: 1000,
            count: result.indexMessageIds ? result.indexMessageIds.length : 0,
            messageIds: result.indexMessageIds ?? []
        };
    }

    /**
     * Get the message data by id.
     * @param messageId The message to get the data for.
     * @returns The message data.
     */
    public async message(messageId: string): Promise<IMessage> {
        const result = await this._apiClient.search({
            network: this._network,
            query: messageId
        });

        if (result.message) {
            return result.message;
        }

        throw new Error("Unable to find message");
    }
}
