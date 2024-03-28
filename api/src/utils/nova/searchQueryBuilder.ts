/* eslint-disable @typescript-eslint/no-unsafe-enum-comparison */
import { AddressType, HexEncodedString } from "@iota/sdk-nova";
import { AddressHelper } from "./addressHelper";
import { IAddressDetails } from "../../models/api/nova/IAddressDetails";
import { Converter } from "../convertUtils";
import { HexHelper } from "../hexHelper";

export interface SearchQuery {
    /**
     * The query string in lower case.
     */
    queryLower: string;
    /**
     * The slotIndex query.
     */
    slotIndex?: number;
    /**
     * The MaybeAddress query.
     */
    address?: IAddressDetails;
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
    outputId?: string;
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
     * The anchorId query.
     */
    anchorId?: string;
    /**
     * The delegationId query.
     */
    delegationId?: string;
    /**
     * The tag of an output.
     */
    tag?: HexEncodedString;
    /**
     * A slot commitment id.
     */
    slotCommitmentId?: string;
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
        let address: IAddressDetails;
        let blockId: string;
        let transactionId: string;
        let outputId: string;
        let accountId: string;
        let nftId: string;
        let foundryId: string;
        let anchorId: string;
        let delegationId: string;
        let tag: string;
        let slotCommitmentId: string;

        const queryDetails = AddressHelper.buildAddress(this.networkBechHrp, this.queryLower);
        const slotIndex = /^\d+$/.test(this.query) ? Number.parseInt(this.query, 10) : undefined;

        // if the source query was valid bech32, we should directly look for an address
        if (queryDetails.bech32) {
            address = queryDetails;
        } else {
            // if the hex has 74 characters it might be a block id or a tx id
            if (queryDetails?.hex && queryDetails.hex.length === 74) {
                blockId = queryDetails.hex;
                transactionId = queryDetails.hex;
                slotCommitmentId = queryDetails.hex;
            } else if (queryDetails?.hex && queryDetails.hex.length === 66) {
                // if the hex has 66 characters it might be a accoount id or a nft id
                accountId = queryDetails.hex;
                nftId = queryDetails.hex;
                anchorId = queryDetails.hex;
                delegationId = queryDetails.hex;
            } else if (
                // if the hex without prefix is 76 characters and first byte is 08,
                // it might be a FoundryId (tokenId)
                queryDetails.hex &&
                Converter.isHex(queryDetails.hex, true) &&
                queryDetails.hex.length === 78 &&
                Number.parseInt(HexHelper.stripPrefix(queryDetails.hex).slice(0, 2), 16) === AddressType.Account
            ) {
                foundryId = queryDetails.hex;
            } else if (
                // if the hex is 70 characters it might be an outputId
                queryDetails?.hex &&
                queryDetails.hex.length === 78
            ) {
                outputId = queryDetails.hex;
            }

            // also perform a tag search
            const maybeTag = Converter.isHex(this.query, true) ? HexHelper.addPrefix(this.query) : Converter.utf8ToHex(this.query, true);
            if (maybeTag.length < 66) {
                tag = maybeTag;
            }
        }

        return {
            queryLower: this.queryLower,
            slotIndex,
            address,
            blockId,
            transactionId,
            outputId,
            accountId,
            nftId,
            foundryId,
            anchorId,
            delegationId,
            tag,
            slotCommitmentId,
        };
    }
}
