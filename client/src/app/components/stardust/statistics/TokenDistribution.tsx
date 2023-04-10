import React from "react";
import { IDistributionEntry } from "../../../../models/api/stardust/chronicle/ITokenDistributionResponse";
import { LollipopChart } from "./charts/LollipopChart";

interface ITokenDistributionProps {
    data: IDistributionEntry[] | null;
}

export const TokenDistribution: React.FC<ITokenDistributionProps> = ({ data }) => (
    <div className="section token-dist-section">
        <div className="section--header">
            <h2>Token distribution</h2>
        </div>
        <LollipopChart data={data} />
    </div>
);
