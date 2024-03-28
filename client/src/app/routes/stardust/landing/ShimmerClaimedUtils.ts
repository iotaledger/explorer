import { INodeInfoBaseToken } from "@iota/sdk-wasm-stardust/web";
import BigDecimal from "~helpers/bigDecimal";
import { formatAmount } from "~helpers/stardust/valueFormatHelper";

export const COMMAS_REGEX = /\B(?=(\d{3})+(?!\d))/g;

export const buildShimmerClaimedStats = (claimed: string, supply: string, tokenInfo: INodeInfoBaseToken): [string, string] => {
    const bigInt = BigInt(claimed);
    const claimedBd = BigDecimal.fromBigInt(bigInt);
    let claimedFinal = claimedBd.toString();

    const formatFull = bigInt < Math.pow(10, tokenInfo.decimals - 3);
    const decimals = bigInt < Math.pow(10, tokenInfo.decimals) ? 3 : bigInt < Math.pow(10, tokenInfo.decimals + 2) ? 2 : 0;
    claimedFinal = formatAmount(claimedFinal, tokenInfo, formatFull, decimals);
    claimedFinal = claimedFinal.replaceAll(COMMAS_REGEX, ",");

    const claimedPercentBd = new BigDecimal("100", 2).multiply(claimedBd.toString()).divide(supply);

    const claimedPercentFinal = claimedPercentBd.toString() === "0" ? "<0.01%" : claimedPercentBd.toString().concat("%");

    return [claimedFinal, claimedPercentFinal];
};
