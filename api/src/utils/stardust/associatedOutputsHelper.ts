import {
    Client,
    IOutputsResponse,
    QueryParameter,
    AliasQueryParameter,
    FoundryQueryParameter,
    NftQueryParameter,
    AddressType,
} from "@iota/sdk-stardust";
import { ServiceFactory } from "../../factories/serviceFactory";
import { AssociationType, IAssociation } from "../../models/api/stardust/IAssociationsResponse";
import { IBech32AddressDetails } from "../../models/api/stardust/IBech32AddressDetails";
import { INetwork } from "../../models/db/INetwork";

/**
 * Helper class to fetch associated outputs of an address on stardust.
 */
export class AssociatedOutputsHelper {
    public readonly associationToOutputIds: Map<AssociationType, string[]> = new Map();

    private readonly network: INetwork;

    private readonly addressDetails: IBech32AddressDetails;

    constructor(network: INetwork, addressDetails: IBech32AddressDetails) {
        this.network = network;
        this.addressDetails = addressDetails;
    }

    public async fetch() {
        const network = this.network.network;
        const address = this.addressDetails.bech32;

        const client = ServiceFactory.get<Client>(`client-${network}`);
        const promises: Promise<void>[] = [];

        promises.push(
            // Basic output -> owner address
            this.fetchAssociatedOutputIds<QueryParameter>(
                async (query) => client.basicOutputIds([query]),
                { address },
                AssociationType.BASIC_ADDRESS,
            ),
        );

        promises.push(
            // Basic output -> owner address expired outputs
            this.fetchAssociatedOutputIds<QueryParameter[]>(
                async (query) => client.basicOutputIds(query),
                [{ address }, { expiresBefore: Math.floor(Date.now() / 1000) }],
                AssociationType.BASIC_ADDRESS_EXPIRED,
            ),
        );

        promises.push(
            // Basic output -> storage return address
            this.fetchAssociatedOutputIds<QueryParameter>(
                async (query) => client.basicOutputIds([query]),
                { storageDepositReturnAddress: address },
                AssociationType.BASIC_STORAGE_RETURN,
            ),
        );

        promises.push(
            // Basic output -> expiration return address
            this.fetchAssociatedOutputIds<QueryParameter>(
                async (query) => client.basicOutputIds([query]),
                { expirationReturnAddress: address },
                AssociationType.BASIC_EXPIRATION_RETURN,
            ),
        );

        promises.push(
            // Basic output -> sender address
            this.fetchAssociatedOutputIds<QueryParameter>(
                async (query) => client.basicOutputIds([query]),
                { sender: address },
                AssociationType.BASIC_SENDER,
            ),
        );

        // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
        if (this.addressDetails.type === AddressType.Alias && this.addressDetails.hex) {
            const aliasId = this.addressDetails.hex;
            promises.push(
                // Alias id
                this.fetchAssociatedOutputIds<string>(async (query) => client.aliasOutputId(query), aliasId, AssociationType.ALIAS_ID),
            );
        }

        promises.push(
            // Alias output -> state controller address
            this.fetchAssociatedOutputIds<AliasQueryParameter>(
                async (query) => client.aliasOutputIds([query]),
                { stateController: address },
                AssociationType.ALIAS_STATE_CONTROLLER,
            ),
        );

        promises.push(
            // Alias output -> governor address
            this.fetchAssociatedOutputIds<AliasQueryParameter>(
                async (query) => client.aliasOutputIds([query]),
                { governor: address },
                AssociationType.ALIAS_GOVERNOR,
            ),
        );

        promises.push(
            // Alias output -> issuer address
            this.fetchAssociatedOutputIds<AliasQueryParameter>(
                async (query) => client.aliasOutputIds([query]),
                { issuer: address },
                AssociationType.ALIAS_ISSUER,
            ),
        );

        promises.push(
            // Alias output -> sender address
            this.fetchAssociatedOutputIds<AliasQueryParameter>(
                async (query) => client.aliasOutputIds([query]),
                { sender: address },
                AssociationType.ALIAS_SENDER,
            ),
        );

        promises.push(
            // Foundry output ->  alias address
            this.fetchAssociatedOutputIds<FoundryQueryParameter>(
                async (query) => client.foundryOutputIds([query]),
                { aliasAddress: address },
                AssociationType.FOUNDRY_ALIAS,
            ),
        );

        // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
        if (this.addressDetails.type === AddressType.Nft && this.addressDetails.hex) {
            const nftId = this.addressDetails.hex;
            promises.push(
                // Nft id
                this.fetchAssociatedOutputIds<string>(async (query) => client.nftOutputId(query), nftId, AssociationType.NFT_ID),
            );
        }

        promises.push(
            // Nft output -> owner address
            this.fetchAssociatedOutputIds<NftQueryParameter>(
                async (query) => client.nftOutputIds([query]),
                { address },
                AssociationType.NFT_ADDRESS,
            ),
        );

        promises.push(
            // Nft output -> owner address expired outputs
            this.fetchAssociatedOutputIds<NftQueryParameter[]>(
                async (query) => client.nftOutputIds(query),
                [{ address }, { expiresBefore: Math.floor(Date.now() / 1000) }],
                AssociationType.NFT_ADDRESS_EXPIRED,
            ),
        );

        promises.push(
            // Nft output -> storage return address
            this.fetchAssociatedOutputIds<NftQueryParameter>(
                async (query) => client.nftOutputIds([query]),
                { storageDepositReturnAddress: address },
                AssociationType.NFT_STORAGE_RETURN,
            ),
        );

        promises.push(
            // Nft output -> expiration return address
            this.fetchAssociatedOutputIds<NftQueryParameter>(
                async (query) => client.nftOutputIds([query]),
                { expirationReturnAddress: address },
                AssociationType.NFT_EXPIRATION_RETURN,
            ),
        );

        promises.push(
            // Nft output -> issuer address
            this.fetchAssociatedOutputIds<NftQueryParameter>(
                async (query) => client.nftOutputIds([query]),
                { issuer: address },
                AssociationType.NFT_ISSUER,
            ),
        );

        promises.push(
            // Nft output -> sender address
            this.fetchAssociatedOutputIds<NftQueryParameter>(
                async (query) => client.nftOutputIds([query]),
                { sender: address },
                AssociationType.NFT_SENDER,
            ),
        );

        await Promise.all(promises);
    }

    /**
     * Retrieves the associations between output types and output IDs.
     * @returns An array of associations.
     */
    public getAssociations(): IAssociation[] {
        const associations: IAssociation[] = [];
        for (const [type, outputIds] of this.associationToOutputIds.entries()) {
            if (type !== AssociationType.BASIC_ADDRESS_EXPIRED && type !== AssociationType.NFT_ADDRESS_EXPIRED) {
                if (
                    type === AssociationType.BASIC_ADDRESS &&
                    this.associationToOutputIds.get(AssociationType.BASIC_ADDRESS_EXPIRED)?.length > 0
                ) {
                    // remove expired basic outputs from basic address associations if they exist
                    const expiredIds = this.associationToOutputIds.get(AssociationType.BASIC_ADDRESS_EXPIRED);
                    const filteredOutputIds = outputIds.filter((id) => !expiredIds?.includes(id));
                    if (filteredOutputIds.length > 0) {
                        associations.push({ type, outputIds: filteredOutputIds.reverse() });
                    }
                } else if (
                    type === AssociationType.NFT_ADDRESS &&
                    this.associationToOutputIds.get(AssociationType.NFT_ADDRESS_EXPIRED)?.length > 0
                ) {
                    // remove expired nft outputs from nft address associations if they exist
                    const expiredIds = this.associationToOutputIds.get(AssociationType.NFT_ADDRESS_EXPIRED);
                    const filteredOutputIds = outputIds.filter((id) => !expiredIds?.includes(id));
                    if (filteredOutputIds.length > 0) {
                        associations.push({ type, outputIds: filteredOutputIds.reverse() });
                    }
                } else {
                    associations.push({ type, outputIds: outputIds.reverse() });
                }
            }
        }
        return associations;
    }

    /**
     * Generic helper function for fetching associated outputs.
     * @param fetch The function for the API call
     * @param args The parameters to pass to the call
     * @param association The association we are looking for.
     */
    private async fetchAssociatedOutputIds<T>(
        fetch: (req: T) => Promise<IOutputsResponse | string>,
        args: T,
        association: AssociationType,
    ): Promise<void> {
        const associationToOutputIds = this.associationToOutputIds;
        let cursor: string;

        do {
            try {
                let requestArgs: T = null;
                if (typeof args === "string") {
                    requestArgs = args;
                } else if (Array.isArray(args)) {
                    requestArgs = cursor ? ([...args, { cursor }] as T) : args;
                } else {
                    requestArgs = { ...args, cursor };
                }
                const response = await fetch(requestArgs);

                if (typeof response === "string") {
                    const outputIds = associationToOutputIds.get(association);
                    if (outputIds) {
                        associationToOutputIds.set(association, outputIds.concat([response]));
                    } else {
                        associationToOutputIds.set(association, [response]);
                    }
                } else if (response.items.length > 0) {
                    const outputIds = associationToOutputIds.get(association);
                    if (outputIds) {
                        associationToOutputIds.set(association, outputIds.concat(response.items));
                    } else {
                        associationToOutputIds.set(association, response.items);
                    }

                    cursor = response.cursor;
                }
            } catch {}
        } while (cursor);
    }
}
