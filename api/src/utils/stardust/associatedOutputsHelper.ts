import {
    SingleNodeClient, IndexerPluginClient, IOutputsResponse, NFT_ADDRESS_TYPE, ALIAS_ADDRESS_TYPE
} from "@iota/iota.js-stardust";
import { AssociationType } from "../../models/api/stardust/IAssociatedOutputsResponse";
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
        const network = this.network;
        const address = this.addressDetails.bech32;

        const client = new SingleNodeClient(network.provider, {
            userName: network.user,
            password: network.password
        });

        const indexerPlugin = new IndexerPluginClient(client);
        const promises: Promise<void>[] = [];

        promises.push(
            // Basic output -> owner address
            this.tryFetchAssociatedOutputs<Record<string, unknown>>(
                async query => indexerPlugin.basicOutputs(query),
                { addressBech32: address },
                AssociationType.BASIC_ADDRESS
            )
        );

        promises.push(
            // Basic output -> storage return address
            this.tryFetchAssociatedOutputs<Record<string, unknown>>(
                async query => indexerPlugin.basicOutputs(query),
                { storageDepositReturnAddressBech32: address },
                AssociationType.BASIC_STORAGE_RETURN
            )
        );

        promises.push(
            // Basic output -> expiration return address
            this.tryFetchAssociatedOutputs<Record<string, unknown>>(
                async query => indexerPlugin.basicOutputs(query),
                { expirationReturnAddressBech32: address },
                AssociationType.BASIC_EXPIRATION_RETURN
            )
        );

        promises.push(
            // Basic output -> sender address
            this.tryFetchAssociatedOutputs<Record<string, unknown>>(
                async query => indexerPlugin.basicOutputs(query),
                { senderBech32: address },
                AssociationType.BASIC_SENDER
            )
        );

        if (this.addressDetails.type === ALIAS_ADDRESS_TYPE && this.addressDetails.hex) {
            const aliasId = this.addressDetails.hex;
            promises.push(
                // Alias id
                this.tryFetchAssociatedOutputs<string>(
                    async query => indexerPlugin.alias(query),
                    aliasId,
                    AssociationType.ALIAS_ID
                )
            );
        }

        promises.push(
            // Alias output -> state controller address
            this.tryFetchAssociatedOutputs<Record<string, unknown>>(
                async query => indexerPlugin.aliases(query),
                { stateControllerBech32: address },
                AssociationType.ALIAS_STATE_CONTROLLER
            )
        );

        promises.push(
            // Alias output -> governor address
            this.tryFetchAssociatedOutputs<Record<string, unknown>>(
                async query => indexerPlugin.aliases(query),
                { governorBech32: address },
                AssociationType.ALIAS_GOVERNOR
            )
        );

        promises.push(
            // Alias output -> issuer address
            this.tryFetchAssociatedOutputs<Record<string, unknown>>(
                async query => indexerPlugin.aliases(query),
                { issuerBech32: address },
                AssociationType.ALIAS_ISSUER
            )
        );

        promises.push(
            // Alias output -> sender address
            this.tryFetchAssociatedOutputs<Record<string, unknown>>(
                async query => indexerPlugin.aliases(query),
                { senderBech32: address },
                AssociationType.ALIAS_SENDER
            )
        );

        promises.push(
            // Foundry output ->  alias address
            this.tryFetchAssociatedOutputs<Record<string, unknown>>(
                async query => indexerPlugin.foundries(query),
                { aliasAddressBech32: address },
                AssociationType.FOUNDRY_ALIAS
            )
        );

        if (this.addressDetails.type === NFT_ADDRESS_TYPE && this.addressDetails.hex) {
            const nftId = this.addressDetails.hex;
            promises.push(
                // Nft id
                this.tryFetchAssociatedOutputs<string>(
                    async query => indexerPlugin.nft(query),
                    nftId,
                    AssociationType.NFT_ID
                )
            );
        }

        promises.push(
            // Nft output -> owner address
            this.tryFetchAssociatedOutputs<Record<string, unknown>>(
                async query => indexerPlugin.nfts(query),
                { addressBech32: address },
                AssociationType.NFT_ADDRESS
            )
        );

        promises.push(
            // Nft output -> storage return address
            this.tryFetchAssociatedOutputs<Record<string, unknown>>(
                async query => indexerPlugin.nfts(query),
                { storageDepositReturnAddressBech32: address },
                AssociationType.NFT_STORAGE_RETURN
            )
        );

        promises.push(
            // Nft output -> expiration return address
            this.tryFetchAssociatedOutputs<Record<string, unknown>>(
                async query => indexerPlugin.nfts(query),
                { expirationReturnAddressBech32: address },
                AssociationType.NFT_EXPIRATION_RETURN
            )
        );

        promises.push(
            // Nft output -> sender address
            this.tryFetchAssociatedOutputs<Record<string, unknown>>(
                async query => indexerPlugin.nfts(query),
                { senderBech32: address },
                AssociationType.NFT_SENDER
            )
        );

        await Promise.all(promises);
    }

    /**
     * Generic helper function for fetching associated outputs.
     * @param fetch The function for the API call
     * @param args The parameters to pass to the call
     * @param association The association we are looking for.
     */
    private async tryFetchAssociatedOutputs<T>(
        fetch: (req: T) => Promise<IOutputsResponse>,
        args: T,
        association: AssociationType
    ): Promise<void> {
        const associationToOutputIds = this.associationToOutputIds;
        let cursor: string;

        do {
            try {
                const outputs = typeof args === "string" ?
                    await fetch(args) :
                    await fetch({ ...args, cursor });

                if (outputs.items.length > 0) {
                    const outputIds = associationToOutputIds.get(association);

                    if (!outputIds) {
                        associationToOutputIds.set(association, outputs.items);
                    } else {
                        const mergedOutputIds = outputIds.concat(outputs.items);
                        associationToOutputIds.set(association, mergedOutputIds);
                    }
                }

                cursor = outputs.cursor;
            } catch {}
        } while (cursor);
    }
}
