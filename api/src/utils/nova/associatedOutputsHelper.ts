import {
    Client,
    OutputsResponse,
    AddressType,
    BasicOutputQueryParameters,
    AccountOutputQueryParameters,
    AnchorOutputQueryParameters,
    DelegationOutputQueryParameters,
    FoundryOutputQueryParameters,
    NftOutputQueryParameters,
} from "@iota/sdk-nova";
import moment from "moment";
import { ServiceFactory } from "../../factories/serviceFactory";
import { IAddressDetails } from "../../models/api/nova/IAddressDetails";
import { AssociationType, IAssociation } from "../../models/api/nova/IAssociationsResponse";
import { INetwork } from "../../models/db/INetwork";
import { NovaTimeService } from "../../services/nova/novaTimeService";

/**
 * Helper class to fetch associated outputs of an address on stardust.
 */
export class AssociatedOutputsHelper {
    public readonly associationToOutputIds: Map<AssociationType, string[]> = new Map();

    private readonly network: INetwork;

    private readonly addressDetails: IAddressDetails;

    constructor(network: INetwork, addressDetails: IAddressDetails) {
        this.network = network;
        this.addressDetails = addressDetails;
    }

    public async fetch() {
        const network = this.network.network;
        const address = this.addressDetails.bech32;

        const client = ServiceFactory.get<Client>(`client-${network}`);
        const novatimeService = ServiceFactory.get<NovaTimeService>(`nova-time-${network}`);
        const currentSlotIndex = novatimeService.getUnixTimestampToSlotIndex(moment().unix());
        const promises: Promise<void>[] = [];

        // BASIC OUTPUTS

        promises.push(
            // Basic output -> address unlock condition
            this.fetchAssociatedOutputIds<BasicOutputQueryParameters>(
                async (query) => client.basicOutputIds(query),
                { address },
                AssociationType.BASIC_ADDRESS,
            ),
        );

        promises.push(
            // Basic output -> owner address expired outputs
            this.fetchAssociatedOutputIds<BasicOutputQueryParameters>(
                async (query) => client.basicOutputIds(query),
                { address, expiresBefore: currentSlotIndex },
                AssociationType.BASIC_ADDRESS_EXPIRED,
            ),
        );

        promises.push(
            // Basic output -> storage return address
            this.fetchAssociatedOutputIds<BasicOutputQueryParameters>(
                async (query) => client.basicOutputIds(query),
                { storageDepositReturnAddress: address },
                AssociationType.BASIC_STORAGE_RETURN,
            ),
        );

        promises.push(
            // Basic output -> expiration return address
            this.fetchAssociatedOutputIds<BasicOutputQueryParameters>(
                async (query) => client.basicOutputIds(query),
                { expirationReturnAddress: address },
                AssociationType.BASIC_EXPIRATION_RETURN,
            ),
        );

        promises.push(
            // Basic output -> sender address
            this.fetchAssociatedOutputIds<BasicOutputQueryParameters>(
                async (query) => client.basicOutputIds(query),
                { sender: address },
                AssociationType.BASIC_SENDER,
            ),
        );

        // ACCOUNT OUTPUTS

        // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
        if (this.addressDetails.type === AddressType.Account && this.addressDetails.hex) {
            const aliasId = this.addressDetails.hex;
            promises.push(
                // Alias id
                this.fetchAssociatedOutputIds<string>(async (query) => client.accountOutputId(query), aliasId, AssociationType.ACCOUNT_ID),
            );
        }

        promises.push(
            // Alias output -> address unlock condition
            this.fetchAssociatedOutputIds<AccountOutputQueryParameters>(
                async (query) => client.accountOutputIds(query),
                { address },
                AssociationType.ACCOUNT_ADDRESS,
            ),
        );

        promises.push(
            // Alias output -> issuer address
            this.fetchAssociatedOutputIds<AccountOutputQueryParameters>(
                async (query) => client.accountOutputIds(query),
                { issuer: address },
                AssociationType.ACCOUNT_ISSUER,
            ),
        );

        promises.push(
            // Alias output -> sender address
            this.fetchAssociatedOutputIds<AccountOutputQueryParameters>(
                async (query) => client.accountOutputIds(query),
                { sender: address },
                AssociationType.ACCOUNT_SENDER,
            ),
        );

        // ANCHOR OUTPUTS

        // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
        if (this.addressDetails.type === AddressType.Anchor && this.addressDetails.hex) {
            const anchorId = this.addressDetails.hex;
            promises.push(
                // Alias id
                this.fetchAssociatedOutputIds<string>(async (query) => client.anchorOutputId(query), anchorId, AssociationType.ANCHOR_ID),
            );
        }

        promises.push(
            // Anchor output -> state controller address
            this.fetchAssociatedOutputIds<AnchorOutputQueryParameters>(
                async (query) => client.anchorOutputIds(query),
                { stateController: address },
                AssociationType.ANCHOR_STATE_CONTROLLER,
            ),
        );

        promises.push(
            // Anchor output -> governor address
            this.fetchAssociatedOutputIds<AnchorOutputQueryParameters>(
                async (query) => client.anchorOutputIds(query),
                { governor: address },
                AssociationType.ANCHOR_GOVERNOR,
            ),
        );

        promises.push(
            // Anchor output -> issuer address
            this.fetchAssociatedOutputIds<AnchorOutputQueryParameters>(
                async (query) => client.anchorOutputIds(query),
                { issuer: address },
                AssociationType.ANCHOR_ISSUER,
            ),
        );

        promises.push(
            // Anchor output -> sender address
            this.fetchAssociatedOutputIds<AnchorOutputQueryParameters>(
                async (query) => client.anchorOutputIds(query),
                { sender: address },
                AssociationType.ANCHOR_SENDER,
            ),
        );

        // DELEGATION OUTPUTS

        promises.push(
            // Delegation output -> address unlock condition
            this.fetchAssociatedOutputIds<DelegationOutputQueryParameters>(
                async (query) => client.delegationOutputIds(query),
                { address },
                AssociationType.DELEGATION_ADDRESS,
            ),
        );

        promises.push(
            // Delegation output -> validator
            this.fetchAssociatedOutputIds<DelegationOutputQueryParameters>(
                async (query) => client.delegationOutputIds(query),
                { validator: address },
                AssociationType.DELEGATION_VALIDATOR,
            ),
        );

        // FOUNDRY OUTPUTS

        promises.push(
            // Foundry output ->  account address
            this.fetchAssociatedOutputIds<FoundryOutputQueryParameters>(
                async (query) => client.foundryOutputIds(query),
                { account: address },
                AssociationType.FOUNDRY_ACCOUNT,
            ),
        );

        // NFS OUTPUTS

        // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
        if (this.addressDetails.type === AddressType.Nft && this.addressDetails.hex) {
            const nftId = this.addressDetails.hex;
            promises.push(
                // Nft id
                this.fetchAssociatedOutputIds<string>(async (query) => client.nftOutputId(query), nftId, AssociationType.NFT_ID),
            );
        }

        promises.push(
            // Nft output -> address unlock condition
            this.fetchAssociatedOutputIds<NftOutputQueryParameters>(
                async (query) => client.nftOutputIds(query),
                { address },
                AssociationType.NFT_ADDRESS,
            ),
        );

        promises.push(
            // Nft output -> owner address expired outputs
            this.fetchAssociatedOutputIds<NftOutputQueryParameters>(
                async (query) => client.nftOutputIds(query),
                { address, expiresBefore: currentSlotIndex },
                AssociationType.NFT_ADDRESS_EXPIRED,
            ),
        );

        promises.push(
            // Nft output -> storage return address
            this.fetchAssociatedOutputIds<NftOutputQueryParameters>(
                async (query) => client.nftOutputIds(query),
                { storageDepositReturnAddress: address },
                AssociationType.NFT_STORAGE_RETURN,
            ),
        );

        promises.push(
            // Nft output -> expiration return address
            this.fetchAssociatedOutputIds<NftOutputQueryParameters>(
                async (query) => client.nftOutputIds(query),
                { expirationReturnAddress: address },
                AssociationType.NFT_EXPIRATION_RETURN,
            ),
        );

        promises.push(
            // Nft output -> issuer address
            this.fetchAssociatedOutputIds<NftOutputQueryParameters>(
                async (query) => client.nftOutputIds(query),
                { issuer: address },
                AssociationType.NFT_ISSUER,
            ),
        );

        promises.push(
            // Nft output -> sender address
            this.fetchAssociatedOutputIds<NftOutputQueryParameters>(
                async (query) => client.nftOutputIds(query),
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
        fetch: (req: T) => Promise<OutputsResponse | string>,
        args: T,
        association: AssociationType,
    ): Promise<void> {
        const associationToOutputIds = this.associationToOutputIds;
        let cursor: string;

        do {
            try {
                const response = typeof args === "string" ? await fetch(args) : await fetch({ ...args, cursor });

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
