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
                        if (response.block) {
                            promisesResult = {
                                block: response.block,
                            };
                        }
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
                        if (response.output) {
                            promisesResult = {
                                output: response.output,
                            };
                        }
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

        if (searchQuery.delegationId) {
            promises.push(
                this.executeQuery(
                    this.apiService.delegationDetails(searchQuery.delegationId),
                    (response) => {
                        if (response.output) {
                            promisesResult = {
                                output: response.output,
                            };
                            return response.output;
                        }
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
                        if (response.block) {
                            promisesResult = {
                                transactionBlock: response.block,
                            };
                        }
                    },
                    "Transaction included block fetch failed",
                ),
            );
        }

        if (searchQuery.foundryId) {
            promises.push(
                this.executeQuery(
                    this.apiService.foundryDetails(searchQuery.foundryId),
                    (response) => {
                        if (response.foundryDetails) {
                            promisesResult = {
                                foundryId: searchQuery.foundryId,
                            };
                        }
                    },
                    "Foundry details fetch failed",
                ),
            );
        }

        if (searchQuery.slotIndex) {
            promises.push(
                this.executeQuery(
                    this.apiService.getSlotCommitment(searchQuery.slotIndex),
                    (_) => {
                        if (searchQuery.slotIndex) {
                            promisesResult = {
                                slotIndex: String(searchQuery.slotIndex),
                            };
                        }
                    },
                    "Slot commitment fetch failed",
                ),
            );
        }

        if (searchQuery.slotCommitmentId) {
            promises.push(
                this.executeQuery(
                    this.apiService.getCommitment(searchQuery.slotCommitmentId),
                    (result) => {
                        if (result?.slot?.slot) {
                            promisesResult = {
                                slotIndex: String(result.slot.slot),
                            };
                        }
                    },
                    "Slot commitment fetch failed",
                ),
            );
        }

        if (searchQuery.tag) {
            promises.push(
                this.executeQuery(
                    this.apiService.taggedOutputs(searchQuery.tag),
                    (response) => {
                        if (!response.basicOutputs.error || !response.nftOutputs.error) {
                            promisesResult = {
                                taggedOutputs: response,
                            };
                        }
                    },
                    "Tagged details fetch failed",
                ),
            );
        }

        await Promise.allSettled(promises);

        if (promisesResult !== null) {
            return promisesResult;
        }

        if (searchQuery.address?.bech32) {
            return {
                addressDetails: searchQuery.address,
            };
        }

        return { message: "Nothing found" };
    }

    private async executeQuery<T>(query: Promise<T>, successHandler: (result: T) => void, failureMessage: string): Promise<void> {
        try {
            const result = await query;
            if (result) {
                return successHandler(result);
            }

            throw new Error(failureMessage);
        } catch {
            throw new Error(`${failureMessage}`);
        }
    }
}
