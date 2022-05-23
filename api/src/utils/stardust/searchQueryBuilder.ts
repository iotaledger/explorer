import { ALIAS_ADDRESS_TYPE, Bech32Helper, ED25519_ADDRESS_TYPE, NFT_ADDRESS_TYPE } from "@iota/iota.js-stardust";
import { Converter, HexHelper } from "@iota/util.js-stardust";

export interface MaybeAddress {
    /**
     * The bech32 of the address.
     */
    bech32?: string;
    /**
     * The full hex of the address.
     */
    hex?: string;
    /*
     * The hex of the address without prefix.
     */
    hexNoPrefix?: string;
    /**
     * The type of the address.
     */
    addressType: number;
}


export interface SearchQuery {
    /**
     * The query string in lower case.
     */
    queryLower: string;
    /**
     * The did query.
     */
    did?: string;
    /**
     * The milestoneIndex query.
     */
    milestoneIndex?: number;
    /**
     * The milestoneId query.
     */
    milestoneId?: string;
    /**
     * The MaybeAddress query.
     */
    address?: MaybeAddress;
    /**
     * The blockId or transactionId query.
     */
    blockIdOrTransactionId?: string;
    /**
     * The outputId query.
     */
    output?: string;
    /**
     * The aliasId query.
     */
    aliasId?: string;
    /**
     * The nftId query.
     */
    nftId?: string;
    /**
     * The foundryId query.
     */
    foundryId?: string;
    /**
     * The tag of an output.
     */
    tag?: string;
}

/**
 * Builds SearchQuery object from query stirng
 */
export class SearchQueryBuilder {
    /**
     * The query string.
     */
    private readonly query: string;

    /**
     * The query string in lower case.
     */
    private readonly queryLower: string;

    /**
     * Thed human readable part to use for bech32.
     */
    private readonly networkBechHrp: string;

    /**
     * Creates a new instance of SearchQueryBuilder.
     * @param query The query string.
     * @param networkBechHrp The network bechHrp.
     */
    constructor(query: string, networkBechHrp: string) {
        this.query = query;
        this.queryLower = query.toLowerCase();
        this.networkBechHrp = networkBechHrp;
    }

    /**
     * Builds the SearchQuery.
     * @returns the SearchQuery object.
     */
    public build(): SearchQuery {
        let blockIdOrTransactionId: string;
        let output: string;
        let aliasId: string;
        let nftId: string;
        let milestoneId: string;
        let foundryId: string;

        const did = this.queryLower.startsWith("did:iota:") ? this.query : undefined;
        const milestoneIndex = /^\d+$/.test(this.query) ? Number.parseInt(this.query, 10) : undefined;
        const address = this.buildAddress();

        // if the hex without prefix has 64 characters it might be an AliasId, NftId or MilestoneId
        if (address?.hexNoPrefix && address.hexNoPrefix.length === 64) {
            aliasId = address.hex;
            nftId = address.hex;
            milestoneId = address.hex;
        }

        // if the hex without prefix has 66 characters, if might be and Alias or Nft Address
        if (address?.hexNoPrefix && address.hexNoPrefix.length === 66) {
            const typeByte = address.hexNoPrefix.slice(0, 2);
            const maybeAddress = address.hexNoPrefix.slice(2);

            if (Number.parseInt(typeByte, 10) === ALIAS_ADDRESS_TYPE) {
                aliasId = HexHelper.addPrefix(maybeAddress);
            }

            if (Number.parseInt(typeByte, 10) === NFT_ADDRESS_TYPE) {
                nftId = HexHelper.addPrefix(maybeAddress);
            }
        }

        const hexWithPrefix = HexHelper.addPrefix(this.queryLower);
        const hexNoPrefix = HexHelper.stripPrefix(this.queryLower);
        // if the hex without prefix is 76 characters and first byte is 08,
        // it can be a FoundryId or TokenId
        if (Converter.isHex(hexWithPrefix, true) &&
            Number.parseInt(hexNoPrefix.slice(0, 2), 16) === ALIAS_ADDRESS_TYPE && hexNoPrefix.length === 76) {
            foundryId = hexWithPrefix;
        }

        // if the hex has 66 characters, it might be a block or transaction id
        if (address?.hex && address.hex.length === 66) {
            blockIdOrTransactionId = address.hex;
        }

        // if the hex is 70 characters, try and look for an output
        if (address?.hex && address.hex.length === 70) {
            output = address.hex;
        }

        const tag = Converter.utf8ToHex(this.query, true);

        return {
            queryLower: this.queryLower,
            did,
            milestoneIndex,
            milestoneId,
            address,
            blockIdOrTransactionId,
            output,
            aliasId,
            nftId,
            foundryId,
            tag
        };
    }

    /**
     * @returns the MaybeAddress object.
     */
    private buildAddress(): MaybeAddress {
        let bech32: string;
        let hex: string;
        let hexNoPrefix: string;
        let addressType: number;

        const q = this.queryLower;
        const hrp = this.networkBechHrp;

        if (Bech32Helper.matches(q, hrp)) {
            try {
                const result = Bech32Helper.fromBech32(q, hrp);
                if (result) {
                    bech32 = q;
                    addressType = result.addressType;
                    hex = HexHelper.addPrefix(
                        Converter.bytesToHex(result.addressBytes)
                    );
                    hexNoPrefix = HexHelper.stripPrefix(
                        Converter.bytesToHex(result.addressBytes)
                    );
                }
            } catch {}
        }

        if (!bech32) {
            // We assume it's a hex
            hex = HexHelper.addPrefix(q);
            hexNoPrefix = HexHelper.stripPrefix(q);
            addressType = ED25519_ADDRESS_TYPE;
            bech32 = Bech32Helper.toBech32(ED25519_ADDRESS_TYPE, Converter.hexToBytes(hex), hrp);
        }

        return {
           bech32,
           hex,
           hexNoPrefix,
           addressType
        };
    }
}

