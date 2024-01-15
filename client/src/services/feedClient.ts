import { io, Socket } from "socket.io-client";
import { NetworkService } from "./networkService";
import { ServiceFactory } from "~factories/serviceFactory";
import { INetwork } from "~models/config/INetwork";
import { IFeedItem } from "~models/feed/IFeedItem";
import { IFeedItemMetadata } from "~models/feed/IFeedItemMetadata";

export class FeedClient {
    /**
     * Minimun number of each item to keep.
     */
    protected static readonly MIN_ITEMS_PER_TYPE: number = 50;

    /**
     * The endpoint for performing communications.
     */
    protected readonly _endpoint: string;

    /**
     * Network configuration.
     */
    protected readonly _networkId: string;

    /**
     * Network configuration.
     */
    protected readonly _networkConfig?: INetwork;

    /**
     * The web socket to communicate on.
     */
    protected readonly _socket: Socket;

    /**
     * The latest items.
     */
    protected _items: IFeedItem[];

    /**
     * Existing ids.
     */
    protected _existingIds: string[];

    /**
     * The subscription id.
     */
    protected _subscriptionId?: string;

    /**
     * The subscribers.
     */
    protected readonly _subscribers: {
        [id: string]: (newItems: IFeedItem[], metaData: { [id: string]: IFeedItemMetadata }) => void;
    };

    /**
     * Create a new instance of TransactionsClient.
     * @param endpoint The endpoint for the api.
     * @param networkId The network configurations.
     */
    constructor(endpoint: string, networkId: string) {
        this._endpoint = endpoint;
        this._networkId = networkId;

        const networkService = ServiceFactory.get<NetworkService>("network");
        this._networkConfig = networkService.get(this._networkId);

        // Use websocket by default
        // eslint-disable-next-line new-cap
        this._socket = io(this._endpoint, { upgrade: true, transports: ["websocket"] });

        // If reconnect fails then also try polling mode.
        this._socket.on("reconnect_attempt", () => {
            this._socket.io.opts.transports = ["polling", "websocket"];
        });

        this._items = [];
        this._existingIds = [];
        this._subscribers = {};
    }
}
