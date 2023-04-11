import React from "react";
import { useTokenDistributionState } from "../../../../helpers/hooks/useTokenDistributionState";
import { LollipopChart } from "./charts/LollipopChart";
import { RichestAddresses } from "./RichestAddresses";

export const TokenDistributionTab: React.FC = () => {
    const [richestAddresses, tokenDistribution] = useTokenDistributionState();

    return (
        <div className="statistics-page__token-dist">
            <div className="section token-dist-section">
                <div className="section--header">
                    <h2>Token distribution</h2>
                </div>
                <LollipopChart data={tokenDistribution} />
            </div>
            <RichestAddresses data={richestAddresses} />
        </div>
    );
};
