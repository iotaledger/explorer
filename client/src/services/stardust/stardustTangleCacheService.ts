/* eslint-disable camelcase */
import { IBlock, IBlockMetadata, IOutputResponse } from "@iota/iota.js-stardust";
import { ServiceFactory } from "../../factories/serviceFactory";
import { IBech32AddressDetails } from "../../models/api/IBech32AddressDetails";
import { IAliasRequest } from "../../models/api/stardust/IAliasRequest";
import { IAliasResponse } from "../../models/api/stardust/IAliasResponse";
import { IAssociatedOutputsResponse } from "../../models/api/stardust/IAssociatedOutputsResponse";
import { IFoundriesRequest } from "../../models/api/stardust/IFoundriesRequest";
import { IFoundriesResponse } from "../../models/api/stardust/IFoundriesResponse";
import { IFoundryRequest } from "../../models/api/stardust/IFoundryRequest";
import { IFoundryResponse } from "../../models/api/stardust/IFoundryResponse";
import { IMilestoneDetailsResponse } from "../../models/api/stardust/IMilestoneDetailsResponse";
import { INftAddressDetailsRequest } from "../../models/api/stardust/INftAddressDetailsRequest";
import { INftAddressDetailsResponse } from "../../models/api/stardust/INftAddressDetailsResponse";
import { INftDetailsRequest } from "../../models/api/stardust/INftDetailsRequest";
import { INftDetailsResponse } from "../../models/api/stardust/INftDetailsResponse";
import { INftOutputsRequest } from "../../models/api/stardust/INftOutputsRequest";
import { INftOutputsResponse } from "../../models/api/stardust/INftOutputsResponse";
import { ISearchResponse } from "../../models/api/stardust/ISearchResponse";
import { ITransactionHistoryRequest } from "../../models/api/stardust/ITransactionHistoryRequest";
import { ITransactionHistoryResponse } from "../../models/api/stardust/ITransactionHistoryResponse";
import { STARDUST } from "../../models/config/protocolVersion";
import { TangleCacheService } from "../tangleCacheService";
import { StardustApiClient } from "./stardustApiClient";

/**
 * Cache tangle requests for stardust.
 */
export class StardustTangleCacheService extends TangleCacheService {
    /**
     * Stardust Search results.
     */
    private readonly _stardustSearchCache: {
        /**
         * Network.
         */
        [network: string]: {
            /**
             * The query type.
             */
            [query: string]: {
                /**
                 * Search response.
                 */
                data?: ISearchResponse;

                /**
                 * The time of cache.
                 */
                cached: number;
            };
        };
    };

    /**
     * The stardust API client service.
     */
    private readonly _api: StardustApiClient;

    /**
     * The key for the API client in service factory.
     */
    private readonly API_CLIENT_KEY = `api-client-${STARDUST}`;

    /**
     * Creates a new instance of StardustTangleCacheService.
     */
    constructor() {
        super();
        this._stardustSearchCache = {};

        const networks = this._networkService.networks();
        for (const networkConfig of networks) {
            this._stardustSearchCache[networkConfig.network] = {};
        }

        this._api = ServiceFactory.get<StardustApiClient>(this.API_CLIENT_KEY);
    }

    /**
     * Search for items on the network.
     * @param networkId The network to search
     * @param query The query to searh for.
     * @param cursor The cursor for next chunk of data.
     * @returns The search response.
     */
    public async search(networkId: string, query: string, cursor?: string): Promise<ISearchResponse | undefined> {
        const fullQuery = query + (cursor ?? "");

        if (!this._stardustSearchCache[networkId][fullQuery]) {
            const response = await this._api.search({ network: networkId, query });

            if (response.addressDetails ||
                response.block ||
                response.milestone ||
                response.output ||
                response.taggedOutputs ||
                response.transactionBlock ||
                response.aliasId ||
                response.foundryId ||
                response.nftId ||
                response.did ||
                response.addressOutputIds) {
                this._stardustSearchCache[networkId][fullQuery] = {
                    data: response,
                    cached: Date.now()
                };
            }
        }

        return this._stardustSearchCache[networkId][fullQuery]?.data;
    }

    /**
     * Get the block metadata.
     * @param networkId The network to search
     * @param blockId The block if to get the metadata for.
     * @returns The details response.
     */
    public async blockDetails(
        networkId: string,
        blockId: string): Promise<{
            metadata?: IBlockMetadata;
            error?: string;
        }> {
        const response = await this._api.blockDetails({ network: networkId, blockId });

        if (response) {
            return {
                metadata: response.metadata,
                error: response.error
            };
        }

        return {};
    }

    /**
     * Get the block metadata.
     * @param networkId The network to search
     * @param transactionId The transaction to get the metadata for.
     * @returns The details response.
     */
     public async transactionIncludedBlockDetails(
        networkId: string,
        transactionId: string
        ): Promise<IBlock | undefined> {
        if (!this._stardustSearchCache[networkId][transactionId]?.data?.transactionBlock) {
            const response = await this._api.transactionIncludedBlockDetails({ network: networkId, transactionId });

            if (response.block) {
                this._stardustSearchCache[networkId][transactionId] = {
                    data: { transactionBlock: response.block },
                    cached: Date.now()
                };
            }
        }

        return this._stardustSearchCache[networkId][transactionId]?.data?.transactionBlock;
    }

    /**
     * Get the output details.
     * @param networkId The network to search
     * @param outputId The output to get the details for.
     * @returns The details response.
     */
    public async outputDetails(
        networkId: string,
        outputId: string
    ): Promise<IOutputResponse | undefined> {
        if (!this._stardustSearchCache[networkId][outputId]?.data?.output) {
            const response = await this._api.outputDetails({ network: networkId, outputId });

            if (response?.output) {
                this._stardustSearchCache[networkId][outputId] = {
                    data: { output: response.output },
                    cached: Date.now()
                };
            }
        }

        return this._stardustSearchCache[networkId][outputId]?.data?.output;
    }

    /**
     * Get the associated outputs.
     * @param network The network to search
     * @param addressDetails The address details of the address to get the associated outputs for.
     * @returns The associated outputs response.
     */
     public async associatedOutputs(
         network: string,
         addressDetails: IBech32AddressDetails
        ): Promise<IAssociatedOutputsResponse | undefined> {
        const address = addressDetails.bech32;
        if (!this._stardustSearchCache[network][`${address}-associated-outputs`]?.data?.addressAssociatedOutputs) {
            const response = await this._api.associatedOutputs({ network, addressDetails });

            if (response.outputs) {
                this._stardustSearchCache[network][`${address}-associated-outputs`] = {
                    data: { addressAssociatedOutputs: response },
                    cached: Date.now()
                };
            }
        }

        return this._stardustSearchCache[network][`${address}-associated-outputs`].data?.addressAssociatedOutputs;
    }

    /**
     * Get the milestone details.
     * @param networkId The network to search
     * @param milestoneIndex The output to get the details for.
     * @returns The details response.
     */
    public async milestoneDetails(
        networkId: string,
        milestoneIndex: number
    ): Promise<IMilestoneDetailsResponse | undefined> {
        const index = milestoneIndex.toString();
        if (!this._stardustSearchCache[networkId][index]?.data?.milestone) {
            const response = await this._api.milestoneDetails({ network: networkId, milestoneIndex });

            if (response?.milestone) {
                this._stardustSearchCache[networkId][index] = {
                    data: {
                        milestone: response
                    },
                    cached: Date.now()
                };
            }
        }

        return this._stardustSearchCache[networkId][index]?.data?.milestone;
    }

    /**
     * Get the transaction history of an address.
     * @param request The transaction history request object.
     * @returns The transaction history response.
     */
    public async transactionHistory(
        request: ITransactionHistoryRequest
    ): Promise<ITransactionHistoryResponse | undefined> {
        const networkId = request.network;
        const key = `${request.address}${request.cursor}`;
        const cacheEntry = this._stardustSearchCache[networkId][key]?.data?.historyOutputs;

        if (!cacheEntry) {
            const response: ITransactionHistoryResponse = await this._api.transactionHistory(request);

            if (response.items) {
                this._stardustSearchCache[networkId][key] = {
                    data: {
                        historyOutputs: response
                    },
                    cached: Date.now()
                };
            }
        }

        return this._stardustSearchCache[networkId][key]?.data?.historyOutputs;
    }

    /**
     * Get the alias output details by Alias adress.
     * @param request The request.
     * @param skipCache Skip looking in the cache.
     * @returns The Foundry output ids response.
     */
    public async aliasDetails(
        request: IAliasRequest,
        skipCache: boolean = false
    ): Promise<IAliasResponse | undefined> {
        if (!request.aliasId) {
            return;
        }

        const cacheEntry = this._stardustSearchCache[request.network][`${request.aliasId}--details`];

        if (!cacheEntry?.data?.aliasDetails || skipCache) {
            const response = await this._api.aliasDetails(request);

            this._stardustSearchCache[request.network][`${request.aliasId}--details`] = {
                data: { aliasDetails: response.aliasDetails },
                cached: Date.now()
            };
        }

        return {
            aliasDetails: this._stardustSearchCache[request.network][`${request.aliasId}--details`]?.data?.aliasDetails
        };
    }

    /**
     * Get the foundry output details by Foundry id.
     * @param request The request.
     * @param skipCache Skip looking in the cache.
     * @returns The Foundry details response.
     */
    public async foundryDetails(
        request: IFoundryRequest,
        skipCache: boolean = false
    ): Promise<IFoundryResponse | undefined> {
        const cacheEntry = this._stardustSearchCache[request.network][`${request.foundryId}--fdetails`];

        if (!cacheEntry?.data?.foundryDetails || skipCache) {
            const response = await this._api.foundryDetails(request);

            this._stardustSearchCache[request.network][`${request.foundryId}--fdetails`] = {
                data: { foundryDetails: response.foundryDetails },
                cached: Date.now()
            };
        }

        return {
            foundryDetails: this._stardustSearchCache[request.network][`${request.foundryId}--fdetails`]
                ?.data
                    ?.foundryDetails
        };
    }

    /**
     * Get the controlled Foundry output ids by alias address.
     * @param request The request.
     * @param skipCache Skip looking in the cache.
     * @returns The Foundry output ids response.
     */
     public async foundriesByAliasAddress(
        request: IFoundriesRequest,
        skipCache: boolean = false
    ): Promise<IFoundriesResponse | undefined> {
        const cacheEntry = this._stardustSearchCache[request.network][`${request.aliasAddress}--foundries`];

        if (!cacheEntry?.data?.foundryOutputs || skipCache) {
            const foundryOutputs = await this._api.aliasFoundries(request);

            this._stardustSearchCache[request.network][`${request.aliasAddress}--foundries`] = {
                data: { foundryOutputs: foundryOutputs.foundryOutputsResponse },
                cached: Date.now()
            };
        }

        return {
            foundryOutputsResponse:
                this._stardustSearchCache[request.network][`${request.aliasAddress}--foundries`]?.data?.foundryOutputs
        };
    }

    /**
     * Get the NFT outputs of an address.
     * @param request The request.
     * @param skipCache Skip looking in the cache.
     * @returns The NFT outputs response.
     */
    public async nfts(
        request: INftOutputsRequest,
        skipCache: boolean = false
    ): Promise<INftOutputsResponse | undefined> {
        const cacheEntry = this._stardustSearchCache[request.network][`${request.address}--nft-outputs`];

        if (!cacheEntry?.data?.nftOutputs || skipCache) {
            const nftOutputs = await this._api.nftOutputs(request);

            this._stardustSearchCache[request.network][`${request.address}--nft-outputs`] = {
                data: { nftOutputs: nftOutputs.outputs },
                cached: Date.now()
            };
        }

        return {
            outputs: this._stardustSearchCache[request.network][`${request.address}--nft-outputs`]?.data?.nftOutputs
        };
    }

    /**
     * Get the NFT address details.
     * @param request The request.
     * @param skipCache Skip looking in the cache.
     * @returns The NFT outputs response.
     */
     public async nftAddressDetails(
        request: INftAddressDetailsRequest,
        skipCache: boolean = false
    ): Promise<INftAddressDetailsResponse | undefined> {
        const cacheEntry = this._stardustSearchCache[request.network][`${request.nftId}--nft-address-details`];

        if (!cacheEntry?.data?.nftDetails || skipCache) {
            const response = await this._api.nftAddressDetails(request);
            this._stardustSearchCache[request.network][`${request.nftId}--nft-address-details`] = {
                data: { nftAddressDetails: response.nftAddressDetails },
                cached: Date.now()
            };
        }

        return {
            nftAddressDetails: this._stardustSearchCache[request.network][`${request.nftId}--nft-address-details`]
                ?.data?.nftAddressDetails
        };
    }

    /**
     * Get the NFT Details (mock impl).
     * @param request The request.
     * @param skipCache Skip looking in the cache.
     * @returns The NFT outputs response.
     */
     public async nftDetails(
        request: INftDetailsRequest,
        skipCache: boolean = false
    ): Promise<INftDetailsResponse | undefined> {
        const cacheEntry = this._stardustSearchCache[request.network][`${request.nftId}--nft-details`];

        if (!cacheEntry?.data?.nftDetails || skipCache) {
            const nftDetails = await this._api.nftDetails(request);
            this._stardustSearchCache[request.network][`${request.nftId}--nft-details`] = {
                data: {
                    nftDetails
                },
                cached: Date.now()
            };
        }

        return this._stardustSearchCache[request.network][`${request.nftId}--nft-details`]?.data?.nftDetails;
    }

    /**
     * Check all the cached items and remove any stale items.
     */
    protected staleCheck(): void {
        super.staleCheck();
        const now = Date.now();
        for (const net in this._stardustSearchCache) {
            const queries = this._stardustSearchCache[net];
            if (queries) {
                for (const query in queries) {
                    if (now - queries[query].cached >= this.STALE_TIME) {
                        delete queries[query];
                    }
                }
            }
        }
    }
}

