import { HexEncodedString, INodeInfoBaseToken, UnitsHelper } from "@iota/iota.js-stardust";
import { Converter } from "@iota/util.js-stardust";
import * as jsonschema from "jsonschema";
import React from "react";
import Tooltip from "../../app/components/Tooltip";
import nftSchemeIRC27 from "../../assets/schemas/nft-schema-IRC27.json";
import { INftImmutableMetadata } from "../../models/api/stardust/nft/INftImmutableMetadata";
/**
 * The id of the Genesis block.
 */
const GENESIS_BLOCK_ID = "0x0000000000000000000000000000000000000000000000000000000000000000";

/**
 * Format amount using passed base token info.
 * @param value The raw amount to format.
 * @param tokenInfo The token info configuration to use.
 * @param formatFull The should format the value to base unit flag.
 * @param decimalPlaces The decimal places to show.
 * @returns The formatted string.
 */
export function formatAmount(
    value: number,
    tokenInfo: INodeInfoBaseToken,
    formatFull: boolean = false,
    decimalPlaces: number = 2
): string {
    if (formatFull) {
        return `${value} ${tokenInfo.subunit ?? tokenInfo.unit}`;
    }

    const baseTokenValue = value / Math.pow(10, tokenInfo.decimals);
    // useMetricPrefix is broken cause it passes a float value to formatBest
    const amount = tokenInfo.useMetricPrefix
        ? UnitsHelper.formatBest(baseTokenValue)
        : `${toFixedNoRound(baseTokenValue, decimalPlaces)} `;

        return `${amount}${tokenInfo.unit}`;
}

/**
 * Format amount to two decimal places without rounding off.
 * @param value The raw amount to format.
 * @param precision The decimal places to show.
 * @returns The formatted amount.
 */
function toFixedNoRound(value: number, precision: number = 2) {
    const factor = Math.pow(10, precision);
    return Math.floor(value * factor) / factor;
}


/**
 * Add tooltip content for special block id i.e Genesis block.
 * @param id The id of the block.
 * @returns The tooltip content or id.
 */
export function formatSpecialBlockId(id: string): React.ReactNode {
    if (id === GENESIS_BLOCK_ID) {
        return (
            <Tooltip tooltipContent="Genesis block">
                <span className="tooltip__special">{id}</span>
            </Tooltip>
        );
    }
    return id;
}


/**
 * Tries to parse hex data into NFT immutable metadata (tip-27).
 * @param metadataHex The encoded data.
 * @returns The parsed INftImmutableMetadata or undefined.
 */
export function tryParseNftMetadata(metadataHex: HexEncodedString): INftImmutableMetadata | undefined {
    const validator = new jsonschema.Validator();
    try {
        const json: unknown = JSON.parse(Converter.hexToUtf8(metadataHex));
        const result = validator.validate(json, nftSchemeIRC27);

        if (result.valid) {
            return json as INftImmutableMetadata;
        }
    } catch { }
}
