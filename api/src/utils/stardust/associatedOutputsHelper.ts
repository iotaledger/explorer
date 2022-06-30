import {
    SingleNodeClient, IndexerPluginClient, IOutputsResponse, NFT_ADDRESS_TYPE, ALIAS_ADDRESS_TYPE
} from "@iota/iota.js-stardust";
import { AssociationType, IAssociatedOutput } from "../../models/api/stardust/IAssociatedOutputsResponse";
import { IBech32AddressDetails } from "../../models/api/stardust/IBech32AddressDetails";
import { INetwork } from "../../models/db/INetwork";

/**
 * Helper class to fetch associated outputs of an address on stardust.
 */
export class AssociatedOutputsHelper {
    public readonly associatedOutputs: IAssociatedOutput[] = [];

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

        // Basic output -> owner address
        await this.tryFetchAssociatedOutputs(
            async query => indexerPlugin.outputs(query),
            { addressBech32: address },
            AssociationType.BASIC_ADDRESS
        );

        // Basic output -> storage return address
        await this.tryFetchAssociatedOutputs(
            async query => indexerPlugin.outputs(query),
            { storageReturnAddressBech32: address },
            AssociationType.BASIC_STORAGE_RETURN
        );

        // Basic output -> expiration return address
        await this.tryFetchAssociatedOutputs(
            async query => indexerPlugin.outputs(query),
            { expirationReturnAddressBech32: address },
            AssociationType.BASIC_EXPIRATION_RETURN
        );

        // Basic output -> sender address
        await this.tryFetchAssociatedOutputs(
            async query => indexerPlugin.outputs(query),
            { senderBech32: address },
            AssociationType.BASIC_SENDER
        );

        // Alias id
        if (this.addressDetails.type === ALIAS_ADDRESS_TYPE && this.addressDetails.hex) {
            const aliasId = this.addressDetails.hex;
            await this.tryFetchAssociatedOutputs(
                async query => indexerPlugin.alias(query),
                aliasId,
                AssociationType.ALIAS_ID
            );
        }

        // Alias output -> state controller address
        await this.tryFetchAssociatedOutputs(
            async query => indexerPlugin.aliases(query),
            { stateControllerBech32: address },
            AssociationType.ALIAS_STATE_CONTROLLER
        );

        // Alias output -> governor address
        await this.tryFetchAssociatedOutputs(
            async query => indexerPlugin.aliases(query),
            { governorBech32: address },
            AssociationType.ALIAS_GOVERNOR
        );

        // Alias output -> issuer address
        await this.tryFetchAssociatedOutputs(
            async query => indexerPlugin.aliases(query),
            { issuerBech32: address },
            AssociationType.ALIAS_ISSUER
        );

        // Alias output -> sender address
        await this.tryFetchAssociatedOutputs(
            async query => indexerPlugin.aliases(query),
            { senderBech32: address },
            AssociationType.ALIAS_SENDER
        );

        // Foundry output ->  alias address
        await this.tryFetchAssociatedOutputs(
            async query => indexerPlugin.foundries(query),
            { aliasAddressBech32: address },
            AssociationType.FOUNDRY_ALIAS
        );

        // Nft id
        if (this.addressDetails.type === NFT_ADDRESS_TYPE && this.addressDetails.hex) {
            const nftId = this.addressDetails.hex;
            await this.tryFetchAssociatedOutputs(
                async query => indexerPlugin.nft(query),
                nftId,
                AssociationType.NFT_ID
            );
        }

        // Nft output -> owner address
        await this.tryFetchAssociatedOutputs(
            async query => indexerPlugin.nfts(query),
            { addressBech32: address },
            AssociationType.NFT_ADDRESS
        );

        // Nft output -> storage return address
        await this.tryFetchAssociatedOutputs(
            async query => indexerPlugin.nfts(query),
            { storageReturnAddressBech32: address },
            AssociationType.NFT_STORAGE_RETURN
        );

        // Nft output -> expiration return address
        await this.tryFetchAssociatedOutputs(
            async query => indexerPlugin.nfts(query),
            { expirationReturnAddressBech32: address },
            AssociationType.NFT_EXPIRATION_RETURN
        );

        // Nft output -> sender address
        await this.tryFetchAssociatedOutputs(
            async query => indexerPlugin.nfts(query),
            { senderBech32: address },
            AssociationType.NFT_SENDER
        );
    }

    private async tryFetchAssociatedOutputs(
        fetch: (req) => Promise<IOutputsResponse>,
        request: Record<string, unknown> | string,
        association: AssociationType
    ) {
        const associatedOutputs = this.associatedOutputs;
        let cursor: string;

        do {
            try {
                const outputs = typeof request === "string" ?
                    await fetch(request) :
                    await fetch({ ...request, cursor });

                if (outputs.items.length > 0) {
                    for (const outputId of outputs.items) {
                        associatedOutputs.push({ outputId, association });
                    }
                }

                cursor = outputs.cursor;
            } catch {}
        } while (cursor);
    }
}
