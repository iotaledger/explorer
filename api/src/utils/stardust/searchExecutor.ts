import { SearchQuery } from "./searchQueryBuilder";
import { ServiceFactory } from "../../factories/serviceFactory";
import { ISearchResponse } from "../../models/api/stardust/ISearchResponse";
import { INetwork } from "../../models/db/INetwork";
import { StardustApiService } from "../../services/stardust/stardustApiService";

/**
 * Performs the search from a SearchQuery object on a Stardust network.
 */
export class SearchExecutor {
    /**
     * The search query.
     */
    private readonly query: SearchQuery;

    private readonly apiService: StardustApiService;

    constructor(network: INetwork, query: SearchQuery) {
        this.query = query;
        this.apiService = ServiceFactory.get<StardustApiService>(`api-service-${network.network}`);
    }

    public async run(): Promise<ISearchResponse> {
        const searchQuery = this.query;
        const promises: Promise<void>[] = [];
        let promisesResult: ISearchResponse | null = null;

        if (searchQuery.milestoneIndex) {
            promises.push(
                new Promise((resolve, reject) => {
                    this.apiService
                        .milestoneDetailsByIndex(searchQuery.milestoneIndex)
                        .then((milestoneDetails) => {
                            if (milestoneDetails) {
                                promisesResult = {
                                    milestone: milestoneDetails,
                                };
                                resolve();
                            } else {
                                reject(new Error("Milestone (by index) details not present"));
                            }
                        })
                        .catch((_) => {
                            reject(new Error("Milestone by index failed"));
                        });
                }),
            );
        }

        if (searchQuery.milestoneId) {
            promises.push(
                new Promise((resolve, reject) => {
                    this.apiService
                        .milestoneDetailsById(searchQuery.milestoneId)
                        .then((milestoneDetails) => {
                            if (milestoneDetails.blockId) {
                                promisesResult = {
                                    milestone: milestoneDetails,
                                };
                                resolve();
                            } else {
                                reject(new Error("Milestone (by milestoneId) details not present"));
                            }
                        })
                        .catch((_) => {
                            reject(new Error("Milestone by milestoneId failed"));
                        });
                }),
            );
        }

        if (searchQuery.blockId) {
            promises.push(
                new Promise((resolve, reject) => {
                    this.apiService
                        .block(searchQuery.blockId)
                        .then((blockResponse) => {
                            if (blockResponse && !blockResponse.error) {
                                promisesResult = {
                                    block: blockResponse.block,
                                };
                                resolve();
                            } else {
                                reject(new Error("Block response not present"));
                            }
                        })
                        .catch((_) => {
                            reject(new Error("Block fetch failed"));
                        });
                }),
            );
        }

        if (searchQuery.transactionId) {
            promises.push(
                new Promise((resolve, reject) => {
                    this.apiService
                        .transactionIncludedBlock(searchQuery.transactionId)
                        .then((txDetailsResponse) => {
                            if (txDetailsResponse.block && Object.keys(txDetailsResponse.block).length > 0) {
                                promisesResult = {
                                    transactionBlock: txDetailsResponse.block,
                                };
                                resolve();
                            } else {
                                reject(new Error("Block (by transactionId) response not present"));
                            }
                        })
                        .catch((_) => {
                            reject(new Error("Block (by transactionId) fetch failed"));
                        });
                }),
            );
        }

        if (searchQuery.output) {
            promises.push(
                new Promise((resolve, reject) => {
                    this.apiService
                        .outputDetails(searchQuery.output)
                        .then((output) => {
                            if (output) {
                                promisesResult = { output: output.output };
                                resolve();
                            } else {
                                reject(new Error("Output response not present"));
                            }
                        })
                        .catch((_) => {
                            reject(new Error("Output fetch failed"));
                        });
                }),
            );
        }

        if (searchQuery.aliasId) {
            promises.push(
                new Promise((resolve, reject) => {
                    this.apiService
                        .aliasDetails(searchQuery.aliasId)
                        .then((aliasOutputs) => {
                            if (aliasOutputs.aliasDetails) {
                                promisesResult = {
                                    aliasId: searchQuery.aliasId,
                                    did: searchQuery.did,
                                };
                                resolve();
                            } else {
                                reject(new Error("Output (aliasId) not present"));
                            }
                        })
                        .catch((_) => {
                            reject(new Error("Output (aliasId) fetch failed"));
                        });
                }),
            );
        }

        if (searchQuery.nftId) {
            promises.push(
                new Promise((resolve, reject) => {
                    this.apiService
                        .nftDetails(searchQuery.nftId)
                        .then((nftOutputs) => {
                            if (nftOutputs.nftDetails) {
                                promisesResult = {
                                    nftId: searchQuery.nftId,
                                };
                                resolve();
                            } else {
                                reject(new Error("Output (nftId) not present"));
                            }
                        })
                        .catch((_) => {
                            reject(new Error("Output (nftId) fetch failed"));
                        });
                }),
            );
        }

        if (searchQuery.foundryId) {
            promises.push(
                new Promise((resolve, reject) => {
                    this.apiService
                        .foundryDetails(searchQuery.foundryId)
                        .then((foundryOutput) => {
                            if (foundryOutput) {
                                promisesResult = {
                                    foundryId: searchQuery.foundryId,
                                };
                                resolve();
                            } else {
                                reject(new Error("Output (foundryId) not present"));
                            }
                        })
                        .catch((_) => {
                            reject(new Error("Output (foundryId) fetch failed"));
                        });
                }),
            );
        }

        if (searchQuery.tag) {
            promises.push(
                new Promise((resolve, reject) => {
                    this.apiService
                        .taggedOutputs(searchQuery.tag)
                        .then((response) => {
                            if (!response.basicOutputs.error || !response.nftOutputs.error) {
                                promisesResult = {
                                    taggedOutputs: response,
                                };
                                resolve();
                            } else {
                                reject(new Error("Tagged outputs not present"));
                            }
                        })
                        .catch((_) => {
                            reject(new Error("Tagged outputs not present"));
                        });
                }),
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
}
