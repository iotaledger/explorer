import { INodeInfoBaseToken, UnitsHelper } from "@iota/iota.js-stardust";
import BigDecimal from "../../../../helpers/bigDecimal";
import { formatAmount } from "../../../../helpers/stardust/valueFormatHelper";

export const buildShimmerClaimedStats = (
    claimed: string,
    supply: string,
    tokenInfo: INodeInfoBaseToken
): [string, string] => {
    const bigInt = BigInt(claimed);
    const claimedBd = BigDecimal.fromBigInt(bigInt);
    let claimedFinal = claimedBd.toString();

    const formatMagnitude = bigInt > Math.pow(10, tokenInfo.decimals + 3);

    if (formatMagnitude) {
        const smrNoDecimals = claimed.slice(0, -tokenInfo.decimals);
        claimedFinal = UnitsHelper.formatBest(Number(smrNoDecimals), 2).concat(tokenInfo.unit);
    } else {
        const formatFull = bigInt < Math.pow(10, tokenInfo.decimals);
        claimedFinal = formatAmount(Number(claimedFinal), tokenInfo, formatFull);
    }

    const claimedPercentBd = new BigDecimal("100", 2).multiply(
        claimedBd.toString()
    ).divide(supply);

    const claimedPercentFinal = claimedPercentBd.toString() === "0" ?
        "<0.01%" :
        claimedPercentBd.toString().concat("%");

    return [claimedFinal, claimedPercentFinal];
};
