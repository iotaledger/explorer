import { Blake2b } from "@iota/crypto.js";
import { Bech32Helper, ED25519_ADDRESS_TYPE, IAddressOutputsResponse, IMessagesResponse, IMilestoneResponse, IOutputResponse, serializeMessage, SingleNodeClient } from "@iota/iota.js-chrysalis";
import { Converter, WriteStream } from "@iota/util.js";
import { IMessageDetailsResponse } from "../../models/api/chrysalis/IMessageDetailsResponse";
import { ISearchResponse } from "../../models/api/chrysalis/ISearchResponse";
import { ITransactionsDetailsRequest } from "../../models/api/chrysalis/ITransactionsDetailsRequest";
import { ITransactionsDetailsResponse } from "../../models/api/chrysalis/ITransactionsDetailsResponse";
import { INetwork } from "../../models/db/INetwork";
import { ExtendedSingleNodeClient } from "./extendedSingleNodeClient";

/**
 * Helper functions for use with tangle.
 */
export class ChrysalisTangleHelper {
    /**
     * Find item on the chrysalis network.
     * @param network The network to find the items on.
     * @param query The query to use for finding items.
     * @param cursor A cursor if are requesting subsequent pages.
     * @returns The item found.
     */
    public static async search(network: INetwork, query: string, cursor?: string): Promise<ISearchResponse> {
        // If we have a cursor this must be next page of permanode, so don't do the node lookup
        let nodeResult = cursor ? {} : await ChrysalisTangleHelper.searchApi(
            network.provider, network.user, network.password, false, network.bechHrp, query);

        // If there were no results from regular node and we have a permanode
        // or if there were output ids get any additional historic ones
        if (network.permaNodeEndpoint &&
            (Object.keys(nodeResult).length === 0 || nodeResult.addressOutputIds || nodeResult.indexMessageIds)) {
            const permaResult = await ChrysalisTangleHelper.searchApi(
                network.permaNodeEndpoint,
                network.permaNodeEndpointUser,
                network.permaNodeEndpointPassword,
                true,
                network.bechHrp,
                query);

            if (nodeResult.addressOutputIds) {
                if (permaResult.addressOutputIds) {
                    nodeResult.historicAddressOutputIds =
                        permaResult.addressOutputIds.filter(a => !nodeResult.addressOutputIds.includes(a));
                    nodeResult.cursor = permaResult.cursor;
                }
            } else if (nodeResult.indexMessageIds) {
                if (permaResult.indexMessageIds) {
                    nodeResult.indexMessageIds = nodeResult.indexMessageIds.concat(
                        permaResult.indexMessageIds.filter(a => !nodeResult.indexMessageIds.includes(a)));
                    nodeResult.cursor = permaResult.cursor;
                }
            } else {
                nodeResult = permaResult;
            }
        }

        return nodeResult;
    }

    /**
     * Find item on the chrysalis network.
     * @param provider The provider for the REST API.
     * @param user The user for the for the REST API.
     * @param password The password for the REST API.
     * @param isPermanode Is this a permanode endpoint.
     * @param bechHrp The bech32 hrp for the network.
     * @param query The query to use for finding items.
     * @param cursor Cursor data to send with the request.
     * @returns The item found.
     */
    public static async searchApi(
        provider: string,
        user: string | undefined,
        password: string | undefined,
        isPermanode: boolean,
        bechHrp: string,
        query: string,
        cursor?: string): Promise<ISearchResponse> {
        const client = new SingleNodeClient(provider, {
            userName: user,
            password,
            basePath: isPermanode ? "/" : undefined
        });
        let queryLower = query.toLowerCase();

        try {
            // If the query starts with did:iota: then lookup a Decentralized identifier
            if (queryLower.startsWith("did:iota:")) {
                return {
                    did: query
                };
            }
        } catch {
        }
        try {
            // If the query is an integer then lookup a milestone
            if (/^\d+$/.test(query)) {
                const milestone = await client.milestone(Number.parseInt(query, 10));

                return {
                    milestone
                };
            }
        } catch {
        }

        try {
            // If the query is bech format lookup address
            if (Bech32Helper.matches(queryLower, bechHrp)) {
                // Permanode doesn't support the bech32 address endpoint so convert
                // the query to ed25519 format if thats what the type is
                // it will then be tried using the ed25519 address/outputs endpoint
                // later in this process
                if (isPermanode) {
                    const converted = Bech32Helper.fromBech32(queryLower, bechHrp);
                    if (converted.addressType === ED25519_ADDRESS_TYPE) {
                        queryLower = Converter.bytesToHex(converted.addressBytes);
                    }
                } else {
                    const address = await client.address(queryLower);
                    if (address) {
                        const addressOutputs = await client.addressOutputs(queryLower);

                        return {
                            address,
                            addressOutputIds: addressOutputs.outputIds
                        };
                    }
                }
            }
        } catch {
        }

        // If the query is 64 bytes hex, try and look for a message
        if (Converter.isHex(queryLower) && queryLower.length === 64) {
            try {
                const message = await client.message(queryLower);

                if (Object.keys(message).length > 0) {
                    return {
                        message
                    };
                }
            } catch {
            }

            // If the query is 64 bytes hex, try and look for a transaction included message
            try {
                const message = await client.transactionIncludedMessage(queryLower);

                if (Object.keys(message).length > 0) {
                    const writeStream = new WriteStream();
                    serializeMessage(writeStream, message);
                    const includedMessageId = Converter.bytesToHex(Blake2b.sum256(writeStream.finalBytes()));

                    return {
                        message,
                        includedMessageId
                    };
                }
            } catch {
            }
        }

        try {
            // If the query is 68 bytes hex, try and look for an output
            if (Converter.isHex(queryLower) && queryLower.length === 68) {
                const output = await client.output(queryLower);

                return {
                    output
                };
            }
        } catch {
        }

        try {
            // If the query is bech format lookup address
            if (Converter.isHex(queryLower) && queryLower.length === 64) {
                // We have 64 characters hex so could possible be a raw ed25519 address

                // Permanode does not support the address/ed25519 endpoint
                // as it does not maintain utxo state, so we create a dummy
                // for permanode, but we can still get outputs for the address
                const address = isPermanode ? {
                    addressType: ED25519_ADDRESS_TYPE,
                    address: queryLower,
                    balance: 0,
                    dustAllowed: false,
                    ledgerIndex: 0
                } : await client.addressEd25519(queryLower);

                const addressOutputs = await client.addressEd25519Outputs(queryLower);

                if (addressOutputs.count > 0) {
                    const state = (addressOutputs as (IAddressOutputsResponse & {
                        state?: unknown;
                    })).state;

                    return {
                        address,
                        addressOutputIds: addressOutputs.outputIds,
                        cursor: state ? Converter.utf8ToHex(JSON.stringify(state)) : undefined
                    };
                }
            }
        } catch {
        }

        try {
            if (query.length > 0) {
                let messages: IMessagesResponse & { state?: string };
                let indexMessageType: "utf8" | "hex" | undefined;
                let cursorParam = "";

                if (cursor) {
                    cursorParam = `&state=${cursor}`;
                }

                // If the query is between 2 and 128 hex chars assume hex encoded bytes
                if (query.length >= 2 && query.length <= 128 && Converter.isHex(queryLower)) {
                    messages = await client.fetchJson<never, IMessagesResponse & { state?: string }>(
                        "get",
                        `messages?index=${queryLower}${cursorParam}`);

                    if (messages.count > 0) {
                        indexMessageType = "hex";
                    }
                }

                // If not already found and query less than 64 bytes assume its UTF8
                if (!indexMessageType && query.length <= 64) {
                    messages = await client.fetchJson<never, IMessagesResponse & { state?: string }>(
                        "get",
                        `messages?index=${Converter.utf8ToHex(query)}${cursorParam}`);

                    if (messages.count > 0) {
                        indexMessageType = "utf8";
                    }
                }

                if (messages && messages.count > 0) {
                    return {
                        indexMessageIds: messages.messageIds,
                        indexMessageType,
                        cursor: messages.state
                    };
                }
            }
        } catch {
        }

        return {};
    }

    /**
     * Get the message details.
     * @param network The network to find the items on.
     * @param messageId The message id to get the details.
     * @returns The item details.
     */
    public static async messageDetails(network: INetwork, messageId: string): Promise<IMessageDetailsResponse> {
        try {
            const client = new SingleNodeClient(network.provider, {
                userName: network.user,
                password: network.password
            });

            const metadata = await client.messageMetadata(messageId);
            const children = await client.messageChildren(messageId);

            return {
                metadata,
                childrenMessageIds: children ? children.childrenMessageIds : undefined
            };
        } catch {
        }

        if (network.permaNodeEndpoint) {
            try {
                const client = new SingleNodeClient(network.permaNodeEndpoint, {
                    userName: network.permaNodeEndpointUser,
                    password: network.permaNodeEndpointPassword,
                    basePath: "/"
                });

                const metadata = await client.messageMetadata(messageId);
                const children = await client.messageChildren(messageId);

                return {
                    metadata,
                    childrenMessageIds: children ? children.childrenMessageIds : undefined
                };
            } catch {
            }
        }
    }

    /**
     * Get the output details.
     * @param network The network to find the items on.
     * @param outputId The output id to get the details.
     * @returns The item details.
     */
    public static async outputDetails(network: INetwork, outputId: string): Promise<IOutputResponse | undefined> {
        try {
            const client = new SingleNodeClient(network.provider, {
                userName: network.user,
                password: network.password
            });
            return await client.output(outputId);
        } catch {
        }

        if (network.permaNodeEndpoint) {
            try {
                const client = new SingleNodeClient(network.permaNodeEndpoint, {
                    userName: network.permaNodeEndpointUser,
                    password: network.permaNodeEndpointPassword,
                    basePath: "/"
                });
                return await client.output(outputId);
            } catch {
            }
        }
    }

    /**
     * Get the transactions of an address.
     * @param network The network to find the items on.
     * @param request The request.
     * @returns The transactions.
     */
    public static async transactionsDetails(network: INetwork,
        request: ITransactionsDetailsRequest): Promise<ITransactionsDetailsResponse | undefined> {
        if (network.permaNodeEndpoint) {
            try {
                // We use ExtendedSingleNodeClient instead of SingleNodeClient
                // because @iota/iota.js does not support the address/transactions endpoint.
                // The @iota/iota.js dependency must be updated to offer this new feature.
                // This class must be replaced by SingleNodeClient when suported
                const client = new ExtendedSingleNodeClient(network.permaNodeEndpoint, {
                    userName: network.permaNodeEndpointUser,
                    password: network.permaNodeEndpointPassword,
                    basePath: "/"
                });
                return await client.transactionHistory(request);
            } catch {
                return { error: "Failed to fetch" };
            }
        }
    }

    /**
     * Get the milestone details.
     * @param network The network to find the items on.
     * @param milestoneIndex The milestone iindex to get the details.
     * @returns The item details.
     */
    public static async milestoneDetails(
        network: INetwork, milestoneIndex: number): Promise<IMilestoneResponse | undefined> {
        try {
            const client = new SingleNodeClient(network.provider, {
                userName: network.user,
                password: network.password
            });
            return await client.milestone(milestoneIndex);
        } catch {
        }

        if (network.permaNodeEndpoint) {
            try {
                const client = new SingleNodeClient(network.permaNodeEndpoint, {
                    userName: network.permaNodeEndpointUser,
                    password: network.permaNodeEndpointPassword,
                    basePath: "/"
                });
                return await client.milestone(milestoneIndex);
            } catch {
            }
        }
    }
}

