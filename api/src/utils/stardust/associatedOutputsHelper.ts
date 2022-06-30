import {
    SingleNodeClient, IndexerPluginClient, IOutputsResponse
} from "@iota/iota.js-stardust";
import { AssociationType, IAssociatedOutput } from "../../models/api/stardust/IAssociatedOutputsResponse";
import { INetwork } from "../../models/db/INetwork";

/**
 * Helper class to fetch associated outputs of an address on stardust.
 */
export class AssociatedOutputsHelper {
    public readonly associatedOutputs: IAssociatedOutput[] = [];

    private readonly network: INetwork;

    private readonly address: string;

    constructor(network: INetwork, address: string) {
        this.network = network;
        this.address = address;
    }

    public async fetch() {
        const network = this.network;
        const address = this.address;

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
       fetch: (req: Record<string, unknown>) => Promise<IOutputsResponse>,
       request: Record<string, unknown>,
       association: AssociationType
    ) {
        const associatedOutputs = this.associatedOutputs;
        let cursor: string;

        do {
            try {
                const outputs = await fetch({ ...request, cursor });

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
