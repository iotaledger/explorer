import { ServiceFactory } from "../factories/serviceFactory";
import { ICachedTransaction } from "../models/api/ICachedTransaction";
import { ITransactionsCursor } from "../models/api/legacy/ITransactionsCursor";
import { TransactionsGetMode } from "../models/api/legacy/transactionsGetMode";
import { ProtocolVersion } from "../models/config/protocolVersion";
import { NetworkService } from "./networkService";

/**
 * Cache tangle requests.
 */
export class TangleCacheService {
    /**
     * Timeout for stale cached items (5 mins).
     */
    protected readonly STALE_TIME: number = 300000;

    /**
     * The network service.
     */
    protected readonly _networkService: NetworkService;

    /**
     * The cache for the transactions.
     */
    protected readonly _transactionCache: {
        /**
         * Network.
         */
        [network: string]: {
            /**
             * Transaction hash.
             */
            [id: string]: ICachedTransaction;
        };
    };

    /**
     * Find transaction results.
     */
    protected readonly _legacyCache: {
        /**
         * Network.
         */
        [network: string]: {
            /**
             * The hash type.
             */
            [hashKey in TransactionsGetMode]?: {

                /**
                 * The hash.
                 */
                [id: string]: {
                    /**
                     * The transactions hashes found.
                     */
                    transactionHashes: string[];
                    /**
                     * There are more transactions.
                     */
                    cursor: ITransactionsCursor;
                    /**
                     * The time of cache.
                     */
                    cached: number;
                };
            }
        };
    };

    /**
     * Address balance results.
     */
    protected readonly _addressBalances: {
        /**
         * Network.
         */
        [network: string]: {
            /**
             * The address hash.
             */
            [id: string]: {
                /**
                 * The balance for the address.
                 */
                balance: number;
                /**
                 * The time of cache.
                 */
                cached: number;
            };
        };
    };

    /**
     * Streams v0 payload cache.
     */
    protected readonly _streamsV0: {
        /**
         * Network.
         */
        [network: string]: {
            /**
             * The root.
             */
            [id: string]: {
                /**
                 * The payload.
                 */
                payload: string;
                /**
                 * The next root.
                 */
                nextRoot: string;
                /**
                 * The tag.
                 */
                tag: string;
                /**
                 * The time of cache.
                 */
                cached: number;
            };
        };
    };

    /**
     * Protocol versions.
     */
    protected readonly _networkProtocols: { [network: string]: ProtocolVersion };

    /**
     * Create a new instance of TangleCacheService.
     */
    constructor() {
        this._transactionCache = {};
        this._legacyCache = {};
        this._addressBalances = {};
        this._streamsV0 = {};
        this._networkProtocols = {};

        this._networkService = ServiceFactory.get<NetworkService>("network");
        const networks = this._networkService.networks();

        for (const networkConfig of networks) {
            this._transactionCache[networkConfig.network] = {};
            this._networkProtocols[networkConfig.network] = networkConfig.protocolVersion;

            this._legacyCache[networkConfig.network] = {
                tags: {},
                addresses: {},
                bundles: {},
                transaction: {}
            };

            this._addressBalances[networkConfig.network] = {};
            this._streamsV0[networkConfig.network] = {};
        }

        // Check for stale cache items every minute
        setInterval(() => this.staleCheck(), 60000);
    }

    /**
     * Check all the cached items and remove any stale items.
     */
    protected staleCheck(): void {
        const now = Date.now();

        for (const net in this._transactionCache) {
            const tranCache = this._transactionCache[net];
            if (tranCache) {
                for (const tx in tranCache) {
                    if (now - tranCache[tx].cached >= this.STALE_TIME) {
                        delete tranCache[tx];
                    }
                }
            }
        }

        for (const net in this._legacyCache) {
            const findCache = this._legacyCache[net];
            if (findCache) {
                for (const hashType in findCache) {
                    const hashCache = findCache[hashType as TransactionsGetMode];

                    if (hashCache) {
                        for (const hash in hashCache) {
                            if (now - hashCache[hash].cached >= this.STALE_TIME) {
                                delete hashCache[hash];
                            }
                        }
                    }
                }
            }
        }

        for (const net in this._addressBalances) {
            const addrBalance = this._addressBalances[net];
            if (addrBalance) {
                for (const address in addrBalance) {
                    if (now - addrBalance[address].cached >= this.STALE_TIME) {
                        delete addrBalance[address];
                    }
                }
            }
        }
    }
}
