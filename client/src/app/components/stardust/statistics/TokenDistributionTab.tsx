import React from "react";
import graphMessages from "../../../../assets/modals/stardust/statistics/graphs.json";
import { useTokenDistributionState } from "../../../../helpers/hooks/useTokenDistributionState";
import Modal from "../../Modal";
import { LollipopChart } from "./charts/LollipopChart";
import { RichestAddresses } from "./RichestAddresses";

export const TokenDistributionTab: React.FC = () => {
    const [richestAddresses, tokenDistribution] = useTokenDistributionState();

    return (
        <div className="statistics-page__token-dist">
            <div className="section token-dist-section">
                <div className="section--header">
                    <h2>Token distribution</h2>
                    <Modal icon="info" data={graphMessages.tokenDistribution} />
                </div>
                <LollipopChart data={tokenDistribution} />
            </div>
            <RichestAddresses data={richestAddresses} />
        </div>
    );
};
