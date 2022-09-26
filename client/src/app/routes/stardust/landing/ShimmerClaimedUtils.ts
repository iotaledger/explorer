import { INodeInfoBaseToken, UnitsHelper } from "@iota/iota.js-stardust";
import BigDecimal from "../../../../helpers/bigDecimal";
import { formatAmount, toFixedNoRound } from "../../../../helpers/stardust/valueFormatHelper";

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
        const smrWholePart = Number(claimed.slice(0, -tokenInfo.decimals));
        const magnitude = UnitsHelper.calculateBest(smrWholePart);
        const smrBestMagnitude = UnitsHelper.convertUnits(smrWholePart, "", magnitude);
        const smrFormatted = toFixedNoRound(smrBestMagnitude, 2);
        claimedFinal = `${smrFormatted}${magnitude.toLowerCase()} ${tokenInfo.unit}`;
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
