import { IOutputResponse, IOutputsResponse } from "@iota/iota.js-stardust";
import { ISearchResponse } from "../../models/api/stardust/ISearchResponse";
import { INetwork } from "../../models/db/INetwork";
import { SearchQuery } from "./searchQueryBuilder";
import { StardustTangleHelper } from "./stardustTangleHelper";

/**
 * Performs the search from a SearchQuery object on a Stardust network.
 */
export class SearchExecutor {
    /**
     * The network to search on.
     */
    private readonly network: INetwork;

    /**
     * The search query.
     */
    private readonly query: SearchQuery;

    constructor(network: INetwork, query: SearchQuery) {
        this.network = network;
        this.query = query;
    }

    public async run(): Promise<ISearchResponse> {
        const network = this.network;
        const searchQuery = this.query;
        const promises: Promise<void>[] = [];
        let promisesResult: ISearchResponse | null = null;

        if (searchQuery.did) {
            return {
                did: searchQuery.did
            };
        }

        if (searchQuery.milestoneIndex) {
            promises.push(
                new Promise((resolve, reject) => {
                    StardustTangleHelper.milestoneDetailsByIndex(network, searchQuery.milestoneIndex).then(
                        milestoneDetails => {
                            if (milestoneDetails) {
                                promisesResult = {
                                    milestone: milestoneDetails
                                };
                                resolve();
                            } else {
                                reject(new Error("Milestone (by index) details not present"));
                            }
                        }
                    ).catch(_ => {
                        reject(new Error("Milestone by index failed"));
                    });
                })
            );
        }

        if (searchQuery.milestoneId) {
            promises.push(
                new Promise((resolve, reject) => {
                    StardustTangleHelper.milestoneDetailsById(network, searchQuery.milestoneId).then(
                        milestoneDetails => {
                            if (milestoneDetails) {
                                promisesResult = {
                                    milestone: milestoneDetails
                                };
                                resolve();
                            } else {
                                reject(new Error("Milestone (by milestoneId) details not present"));
                            }
                        }
                    ).catch(_ => {
                        reject(new Error("Milestone by milestoneId failed"));
                    });
                })
            );
        }

        if (searchQuery.blockId) {
            promises.push(
                new Promise((resolve, reject) => {
                    StardustTangleHelper.block(network, searchQuery.blockId).then(
                        blockResponse => {
                            if (blockResponse && !blockResponse.error) {
                                promisesResult = {
                                    block: blockResponse.block
                                };
                                resolve();
                            } else {
                                reject(new Error("Block response not present"));
                            }
                        }
                    ).catch(_ => {
                        reject(new Error("Block fetch failed"));
                    });
                })
            );
        }

        if (searchQuery.transactionId) {
            promises.push(
                new Promise((resolve, reject) => {
                    StardustTangleHelper.transactionIncludedBlock(
                        network,
                        searchQuery.transactionId
                    ).then(
                        txDetailsResponse => {
                            if (txDetailsResponse.block && Object.keys(txDetailsResponse.block).length > 0) {
                                promisesResult = {
                                    transactionBlock: txDetailsResponse.block
                                };
                                resolve();
                            } else {
                                reject(new Error("Block (by transactionId) response not present"));
                            }
                        }
                    ).catch(_ => {
                        reject(new Error("Block (by transactionId) fetch failed"));
                    });
                })
            );
        }

        if (searchQuery.output) {
            promises.push(
                new Promise((resolve, reject) => {
                    StardustTangleHelper.tryFetchPermanodeThenNode<string, IOutputResponse>(
                        searchQuery.output,
                        "output",
                        network
                    ).then(
                        output => {
                            if (output) {
                                promisesResult = { output };
                                resolve();
                            } else {
                                reject(new Error("Output response not present"));
                            }
                        }
                    ).catch(_ => {
                        reject(new Error("Output fetch failed"));
                    });
                })
            );
        }

        if (searchQuery.aliasId) {
            promises.push(
                new Promise((resolve, reject) => {
                    StardustTangleHelper.tryFetchPermanodeThenNode<string, IOutputsResponse>(
                        searchQuery.aliasId,
                        "alias",
                        network,
                        true
                    ).then(
                        aliasOutputs => {
                            if (aliasOutputs.items.length > 0) {
                                promisesResult = {
                                    aliasId: searchQuery.aliasId
                                };
                                resolve();
                            } else {
                                reject(new Error("Output (aliasId) not present"));
                            }
                        }
                    ).catch(_ => {
                        reject(new Error("Output (aliasId) fetch failed"));
                    });
                })
            );
        }

        if (searchQuery.nftId) {
            promises.push(
                new Promise((resolve, reject) => {
                    StardustTangleHelper.tryFetchPermanodeThenNode<string, IOutputsResponse>(
                        searchQuery.nftId,
                        "nft",
                        network,
                        true
                    ).then(
                        nftOutputs => {
                            if (nftOutputs.items.length > 0) {
                                promisesResult = {
                                    nftId: searchQuery.nftId
                                };
                                resolve();
                            } else {
                                reject(new Error("Output (nftId) not present"));
                            }
                        }
                    ).catch(_ => {
                        reject(new Error("Output (nftId) fetch failed"));
                    });
                })
            );
        }

        if (searchQuery.foundryId) {
            promises.push(
                new Promise((resolve, reject) => {
                    StardustTangleHelper.tryFetchPermanodeThenNode<string, IOutputsResponse>(
                        searchQuery.foundryId,
                        "foundry",
                        network,
                        true
                    ).then(
                        foundryOutputs => {
                            if (foundryOutputs.items.length > 0) {
                                promisesResult = {
                                    foundryId: searchQuery.foundryId
                                };
                                resolve();
                            } else {
                                reject(new Error("Output (foundryId) not present"));
                            }
                        }
                    ).catch(_ => {
                        reject(new Error("Output (foundryId) fetch failed"));
                    });
                })
            );
        }

        if (searchQuery.tag) {
            promises.push(
                new Promise((resolve, reject) => {
                    StardustTangleHelper.tryFetchPermanodeThenNode<Record<string, unknown>, IOutputsResponse>(
                        { tagHex: searchQuery.tag },
                        "basicOutputs",
                        network,
                        true
                    ).then(
                        taggedOutputs => {
                            if (taggedOutputs.items.length > 0) {
                                promisesResult = {
                                    taggedOutputs
                                };
                                resolve();
                            } else {
                                reject(new Error("Output (tagHex) not present"));
                            }
                        }
                    ).catch(_ => {
                        reject(new Error("Output (tagHex) fetch failed"));
                    });
                })
            );
        }

        await Promise.any(promises).catch(_ => {});

        if (promisesResult !== null) {
            return promisesResult;
        }

        if (searchQuery.address?.bech32) {
            return {
                addressDetails: searchQuery.address
            };
        }

        return {};
    }
}