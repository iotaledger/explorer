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
                    (response) => {
                        promisesResult = {
                            block: response.block,
                            error: response.error || response.message,
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
                    (response) => {
                        promisesResult = {
                            output: response.output,
                            error: response.error || response.message,
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
                        promisesResult = {
                            accountId: response.accountOutputDetails ? searchQuery.accountId : undefined,
                            error: response.error || response.message,
                        };
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
                        promisesResult = {
                            nftId: response.nftOutputDetails ? searchQuery.nftId : undefined,
                            error: response.error || response.message,
                        };
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
                        promisesResult = {
                            anchorId: response.anchorOutputDetails ? searchQuery.anchorId : undefined,
                            error: response.error || response.message,
                        };
                    },
                    "Anchor id fetch failed",
                ),
            );
        }

        if (searchQuery.delegationId) {
            promises.push(
                this.executeQuery(
                    this.apiService.delegationDetails(searchQuery.delegationId),
                    (response) => {
                        promisesResult = {
                            output: response.output,
                            error: response.error || response.message,
                        };
                    },
                    "Delegation id fetch failed",
                ),
            );
        }

        if (searchQuery.transactionId) {
            promises.push(
                this.executeQuery(
                    this.apiService.transactionIncludedBlock(searchQuery.transactionId),
                    (response) => {
                        promisesResult = {
                            transactionBlock: response.block,
                            error: response.error || response.message,
                        };
                    },
                    "Transaction included block fetch failed",
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
            throw new Error(`${failureMessage}`);
        }
    }
}
