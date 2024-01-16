import React, { useContext } from "react";
import { RangeBarChart } from "./charts/RangeBarChart";
import { getSubunitThreshold } from "./ChartUtils";
import { RichestAddresses } from "./RichestAddresses";
import { useTokenDistributionState } from "~helpers/stardust/hooks/useTokenDistributionState";
import { IDistributionEntry } from "~models/api/stardust/chronicle/ITokenDistributionResponse";
import NetworkContext from "../../../context/NetworkContext";

export const TokenDistributionTab: React.FC = () => {
    const { tokenInfo } = useContext(NetworkContext);
    const [richestAddresses, tokenDistribution] = useTokenDistributionState();

    // prepare data (merge negative ranges)
    let data = tokenDistribution;
    const subunitThreshold = getSubunitThreshold(tokenInfo);
    if (subunitThreshold) {
        const negativeRanges = tokenDistribution?.filter((entry) => entry.range.start < subunitThreshold);
        const positiveRanges = tokenDistribution?.filter((entry) => entry.range.start >= subunitThreshold);
        if (negativeRanges && positiveRanges) {
            const merged: IDistributionEntry = {
                addressCount: negativeRanges
                    .map((e) => e.addressCount)
                    .reduce((sum, curr) => sum + Number(curr), 0)
                    .toString(),
                totalBalance: negativeRanges
                    .map((e) => e.totalBalance)
                    .reduce((sum, curr) => sum + Number(curr), 0)
                    .toString(),
                range: {
                    start: Math.min(...negativeRanges.map((e) => e.range.start)),
                    end: Math.max(...negativeRanges.map((e) => e.range.end)),
                },
            };

            data = [merged, ...positiveRanges];
        }
    }

    return (
        <div className="statistics-page__token-dist">
            <div className="section token-dist-section">
                <div className="section--header">
                    <h2>Token distribution</h2>
                </div>
                <RangeBarChart data={data} yField="addressCount" yLabel="ADDRESSES" />
                <RangeBarChart data={data} yField="totalBalance" yLabel={`TOTAL ${tokenInfo.unit} HELD`} />
            </div>
            <RichestAddresses data={richestAddresses} />
        </div>
    );
};
