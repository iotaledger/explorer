/* eslint-disable @typescript-eslint/no-unsafe-enum-comparison */
import { AddressType, HexEncodedString } from "@iota/sdk-nova";
import { Converter } from "../convertUtils";
import { HexHelper } from "../hexHelper";

interface QueryDetails {
    /**
     * The bech32 format.
     */
    bech32: string;
    /**
     * The hex format.
     */
    hex?: string;
    /*
     * The hex without prefix.
     */
    hexNoPrefix?: string;
    /**
     * The raw address type.
     */
    type: number;
    /**
     * The type label.
     */
    typeLabel: string;
    /**
     * The initial query was already valid bech32.
     */
    isBech32: boolean;
}

export interface SearchQuery {
    /**
     * The query string in lower case.
     */
    queryLower: string;
    /**
     * The MaybeAddress query.
     */
    address?: QueryDetails;
    /**
     * The blockId query.
     */
    blockId?: string;
    /**
     * The transactionId query.
     */
    transactionId?: string;
    /**
     * The outputId query.
     */
    output?: string;
    /**
     * The accountId query.
     */
    accountId?: string;
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
    tag?: HexEncodedString;
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
        let address: QueryDetails;
        let blockId: string;
        let transactionId: string;
        let output: string;
        let accountId: string;
        let nftId: string;
        let foundryId: string;
        let tag: string;

        const queryDetails = this.buildQueryDetails();

        // if the source query was valid bech32, we should directly look for an address
        if (queryDetails.isBech32) {
            address = queryDetails;
        } else {
            // if the hex without prefix has 64 characters it might be an alias, nft, milestone, block or tx ID
            if (queryDetails?.hex && queryDetails.hex.length === 74) {
                accountId = queryDetails.hex;
                nftId = queryDetails.hex;
                blockId = queryDetails.hex;
                transactionId = queryDetails.hex;
            } else if (
                // if the hex without prefix is 76 characters and first byte is 08,
                // it might be a FoundryId (tokenId)
                queryDetails.hex &&
                queryDetails.hexNoPrefix &&
                Converter.isHex(queryDetails.hex, true) &&
                queryDetails.hexNoPrefix.length === 76 &&
                Number.parseInt(queryDetails.hexNoPrefix.slice(0, 2), 16) === AddressType.Account
            ) {
                foundryId = queryDetails.hex;
            } else if (
                // if the hex is 70 characters it might be an output
                queryDetails?.hex &&
                queryDetails.hex.length === 70
            ) {
                output = queryDetails.hex;
            }

            // also perform a tag search
            const maybeTag = Converter.isHex(this.query, true) ? HexHelper.addPrefix(this.query) : Converter.utf8ToHex(this.query, true);
            if (maybeTag.length < 66) {
                tag = maybeTag;
            }
        }

        return {
            queryLower: this.queryLower,
            address,
            blockId,
            transactionId,
            output,
            accountId,
            nftId,
            foundryId,
            tag,
        };
    }

    /**
     * @returns the QueryDetails object.
     */
    private buildQueryDetails(): QueryDetails {
        let bech32: string;
        const hex: string;
        let hexNoPrefix: string;
        let addressType: number;
        const isBech32: boolean = false;

        const q = this.queryLower;
        // const hrp = this.networkBechHrp;

        // if (Bech32Helper.matches(q, hrp)) {
        //     isBech32 = true;

        //     try {
        //         const result = Utils.parseBech32Address(q);
        //         if (result) {
        //             bech32 = q;
        //             addressType = result.type;
        //             hex = HexHelper.addPrefix(result.toString());
        //             hexNoPrefix = HexHelper.stripPrefix(result.toString());
        //         }
        //     } catch {}
        // }

        // if (!isBech32) {
        // We assume it's a hex
        hex = HexHelper.addPrefix(q);
        // hexNoPrefix = HexHelper.stripPrefix(q);
        // addressType = AddressType.Ed25519;
        // bech32 = Bech32Helper.toBech32(AddressType.Ed25519, Converter.hexToBytes(hex), hrp);
        // }

        return {
            bech32,
            hex,
            hexNoPrefix,
            type: addressType,
            typeLabel: this.typeLabel(addressType),
            isBech32,
        };
    }

    /**
     * Convert the address type number to a label.
     * @param addressType The address type to get the label for.
     * @returns The label.
     */
    private typeLabel(addressType?: number): string | undefined {
        if (addressType === AddressType.Ed25519) {
            return "Ed25519";
        } else if (addressType === AddressType.Account) {
            return "Account";
        } else if (addressType === AddressType.Nft) {
            return "NFT";
        }
    }
}
