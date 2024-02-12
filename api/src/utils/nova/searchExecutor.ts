import { SearchQuery } from "./searchQueryBuilder";
import { ServiceFactory } from "../../factories/serviceFactory";
import { ISearchResponse } from "../../models/api/nova/ISearchResponse";
import { INetwork } from "../../models/db/INetwork";
import { NovaApiService } from "../../services/nova/novaApiService";

export class SearchExecutor {
    /**
     * The search query.
     */
    private readonly query: SearchQuery;

    private readonly apiService: NovaApiService;

    constructor(network: INetwork, query: SearchQuery) {
        this.query = query;
        this.apiService = ServiceFactory.get<NovaApiService>(`api-service-${network.network}`);
    }

    public async run(): Promise<ISearchResponse> {
        const searchQuery = this.query;
        const promises: Promise<void>[] = [];
        let promisesResult: ISearchResponse | null = null;

        if (searchQuery.blockId) {
            promises.push(
                this.executeQuery(
                    this.apiService.block(searchQuery.blockId),
                    (blockResponse) => {
                        promisesResult = {
                            block: blockResponse.block,
                        };
                    },
                    "Block fetch failed",
                ),
            );
        }

        if (searchQuery.outputId) {
            promises.push(
                this.executeQuery(
                    this.apiService.outputDetails(searchQuery.outputId),
                    (outputDetails) => {
                        promisesResult = {
                            output: outputDetails.output,
                        };
                    },
                    "Output fetch failed",
                ),
            );
        }

        if (searchQuery.accountId) {
            promises.push(
                this.executeQuery(
                    this.apiService.accountDetails(searchQuery.accountId),
                    (response) => {
                        if (response.accountOutputDetails) {
                            promisesResult = {
                                accountId: searchQuery.accountId,
                            };
                        }
                    },
                    "Account id fetch failed",
                ),
            );
        }

        if (searchQuery.nftId) {
            promises.push(
                this.executeQuery(
                    this.apiService.nftDetails(searchQuery.nftId),
                    (response) => {
                        if (response.nftOutputDetails) {
                            promisesResult = {
                                nftId: searchQuery.nftId,
                            };
                        }
                    },
                    "Nft id fetch failed",
                ),
            );
        }

        if (searchQuery.anchorId) {
            promises.push(
                this.executeQuery(
                    this.apiService.anchorDetails(searchQuery.anchorId),
                    (response) => {
                        if (response.anchorOutputDetails) {
                            promisesResult = {
                                anchorId: searchQuery.anchorId,
                            };
                        }
                    },
                    "Anchor id fetch failed",
                ),
            );
        }

        await Promise.any(promises).catch((_) => {});

        if (promisesResult !== null) {
            return promisesResult;
        }

        if (searchQuery.address?.bech32) {
            return {
                addressDetails: searchQuery.address,
            };
        }

        return {};
    }

    private async executeQuery<T>(query: Promise<T>, successHandler: (result: T) => void, failureMessage: string): Promise<void> {
        try {
            const result = await query;
            if (result) {
                successHandler(result);
            } else {
                throw new Error(failureMessage);
            }
        } catch {
            throw new Error(failureMessage);
        }
    }
}
