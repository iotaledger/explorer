import { SearchQuery } from "./searchQueryBuilder";
import { ServiceFactory } from "../../factories/serviceFactory";
import { ISearchResponse } from "../../models/api/nova/ISearchResponse";
import { INetwork } from "../../models/db/INetwork";
import { NovaApiService } from "../../services/nova/novaApiService";
import { ValidationHelper } from "../validationHelper";

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
                new Promise((resolve, reject) => {
                    this.apiService
                        .block(searchQuery.blockId)
                        .then((response) => {
                            if (response.block) {
                                promisesResult = {
                                    block: response.block,
                                };
                                resolve();
                            } else {
                                reject(new Error("Block fetch failed"));
                            }
                        })
                        .catch((_) => {
                            reject(new Error("Block fetch failed"));
                        });
                }),
            );
        }

        if (searchQuery.outputId) {
            promises.push(
                new Promise((resolve, reject) => {
                    this.apiService
                        .outputDetails(searchQuery.outputId)
                        .then((response) => {
                            if (response.output) {
                                promisesResult = {
                                    output: response.output,
                                };
                                resolve();
                            } else {
                                reject(new Error("Output fetch failed"));
                            }
                        })
                        .catch((_) => {
                            reject(new Error("Output fetch failed"));
                        });
                }),
            );
        }

        if (searchQuery.accountId) {
            promises.push(
                new Promise((resolve, reject) => {
                    this.apiService
                        .accountDetails(searchQuery.accountId)
                        .then((response) => {
                            if (response.accountOutputDetails) {
                                promisesResult = {
                                    accountId: searchQuery.accountId,
                                };
                                resolve();
                            } else {
                                reject(new Error("Account id fetch failed"));
                            }
                        })
                        .catch((_) => {
                            reject(new Error("Account id fetch failed"));
                        });
                }),
            );
        }

        if (searchQuery.nftId) {
            promises.push(
                new Promise((resolve, reject) => {
                    this.apiService
                        .nftDetails(searchQuery.nftId)
                        .then((response) => {
                            if (response.nftOutputDetails) {
                                promisesResult = {
                                    nftId: searchQuery.nftId,
                                };
                                resolve();
                            } else {
                                reject(new Error("Nft id fetch failed"));
                            }
                        })
                        .catch((_) => {
                            reject(new Error("Nft id fetch failed"));
                        });
                }),
            );
        }

        if (searchQuery.anchorId) {
            promises.push(
                new Promise((resolve, reject) => {
                    this.apiService
                        .anchorDetails(searchQuery.anchorId)
                        .then((response) => {
                            if (response.anchorOutputDetails) {
                                promisesResult = {
                                    anchorId: searchQuery.anchorId,
                                };
                                resolve();
                            } else {
                                reject(new Error("Anchor id fetch failed"));
                            }
                        })
                        .catch((_) => {
                            reject(new Error("Anchor id fetch failed"));
                        });
                }),
            );
        }

        if (searchQuery.delegationId) {
            promises.push(
                new Promise((resolve, reject) => {
                    this.apiService
                        .delegationDetails(searchQuery.delegationId)
                        .then((response) => {
                            if (response.output) {
                                promisesResult = {
                                    output: response.output,
                                };
                                resolve();
                            } else {
                                reject(new Error("Delegation id fetch failed"));
                            }
                        })
                        .catch((_) => {
                            reject(new Error("Delegation id fetch failed"));
                        });
                }),
            );
        }

        if (searchQuery.transactionId) {
            promises.push(
                new Promise((resolve, reject) => {
                    this.apiService
                        .transactionIncludedBlock(searchQuery.transactionId)
                        .then((response) => {
                            if (response.block) {
                                promisesResult = {
                                    transactionBlock: response.block,
                                };
                                resolve();
                            } else {
                                reject(new Error("Transaction included block fetch failed"));
                            }
                        })
                        .catch((_) => {
                            reject(new Error("Transaction included block fetch failed"));
                        });
                }),
            );
        }

        if (searchQuery.foundryId) {
            promises.push(
                new Promise((resolve, reject) => {
                    this.apiService
                        .foundryDetails(searchQuery.foundryId)
                        .then((response) => {
                            if (response.foundryDetails) {
                                promisesResult = {
                                    foundryId: searchQuery.foundryId,
                                };
                                resolve();
                            } else {
                                reject(new Error("Foundry details fetch failed"));
                            }
                        })
                        .catch((_) => {
                            reject(new Error("Foundry details fetch failed"));
                        });
                }),
            );
        }

        if (searchQuery.slotIndex) {
            promises.push(
                new Promise((resolve, reject) => {
                    this.apiService
                        .getSlotCommitment(searchQuery.slotIndex)
                        .then((response) => {
                            if (ValidationHelper.isNumber(response?.slot?.slot)) {
                                promisesResult = {
                                    slotIndex: String(response.slot?.slot),
                                };
                                resolve();
                            } else {
                                reject(new Error("Slot commitment fetch failed"));
                            }
                        })
                        .catch((_) => {
                            reject(new Error("Slot commitment fetch failed"));
                        });
                }),
            );
        }

        if (searchQuery.slotCommitmentId) {
            promises.push(
                new Promise((resolve, reject) => {
                    this.apiService
                        .getCommitment(searchQuery.slotCommitmentId)
                        .then((response) => {
                            if (ValidationHelper.isNumber(response?.slot?.slot)) {
                                promisesResult = {
                                    slotIndex: String(response.slot.slot),
                                };
                                resolve();
                            } else {
                                reject(new Error("Slot commitment fetch failed"));
                            }
                        })
                        .catch((_) => {
                            reject(new Error("Slot commitment fetch failed"));
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
                            if (response?.basicOutputs?.outputs || response?.nftOutputs?.outputs) {
                                promisesResult = {
                                    taggedOutputs: response,
                                };
                                resolve();
                            } else {
                                reject(new Error("Tagged details fetch failed"));
                            }
                        })
                        .catch((_) => {
                            reject(new Error("Tagged details fetch failed"));
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

        return { message: "Nothing found" };
    }
}
