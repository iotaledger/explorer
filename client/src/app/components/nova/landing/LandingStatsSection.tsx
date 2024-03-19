import React from "react";
import BigDecimal from "~/helpers/bigDecimal";
import { useChronicleAnalytics } from "~/helpers/nova/hooks/useChronicleAnalytics";
import { useValidatorStats } from "~/helpers/nova/hooks/useValidatorStats";
import { useNetworkInfoNova } from "~/helpers/nova/networkInfo";
import "./LandingStatsSection.scss";

const LandingStatsSection: React.FC = () => {
    const { protocolInfo } = useNetworkInfoNova((s) => s.networkInfo);
    const { chronicleAnalyticStats } = useChronicleAnalytics();
    const { validatorStats } = useValidatorStats();
    const { validatorsSize, totalPoolStake, totalValidatorStake, totalActiveValidatorStake } = validatorStats ?? {};

    const accountsCount = chronicleAnalyticStats?.accountAddressesWithBalance ?? null;
    const delegatorsCount = chronicleAnalyticStats?.delegatorsCount ?? null;

    const totalSupply = protocolInfo?.parameters.tokenSupply ?? null;
    const totalDelegatedStake = totalPoolStake && totalValidatorStake ? BigInt(totalPoolStake) - BigInt(totalValidatorStake) : null;

    let percentStaked = "-";
    let percentDelegated = "-";
    if (totalSupply !== null && totalDelegatedStake !== null && totalValidatorStake) {
        const totalStakedDecimal = new BigDecimal(totalValidatorStake);
        const totalDelegatedDecimal = BigDecimal.fromBigInt(totalDelegatedStake);

        percentStaked = new BigDecimal("100", 10).multiply(totalStakedDecimal.toString()).divide(totalSupply).toString();
        percentDelegated = new BigDecimal("100", 10).multiply(totalDelegatedDecimal.toString()).divide(totalSupply).toString();
    }

    return (
        <div className="stats-section">
            <h2 className="stats-section__header">Stats</h2>
            <div className="stats-section__wrapper">
                <div className="stat-entry">
                    <div className="stat-entry__label"># Accounts:</div>
                    <div className="stat-entry__value">{accountsCount ?? "-"}</div>
                </div>
                <div className="stat-entry">
                    <div className="stat-entry__label"># Validators:</div>
                    <div className="stat-entry__value">{validatorsSize}</div>
                </div>
                <div className="stat-entry">
                    <div className="stat-entry__label">Staked (%):</div>
                    <div className="stat-entry__value">{percentStaked}%</div>
                </div>
                <div className="stat-entry">
                    <div className="stat-entry__label">Delegated (%):</div>
                    <div className="stat-entry__value">{percentDelegated}%</div>
                </div>
            </div>
            <div className="stats-section__wrapper">
                <div className="stat-entry">
                    <div className="stat-entry__label"># Staked total:</div>
                    <div className="stat-entry__value">{totalValidatorStake}</div>
                </div>
                <div className="stat-entry">
                    <div className="stat-entry__label"># Staked active set:</div>
                    <div className="stat-entry__value">{totalActiveValidatorStake}</div>
                </div>
                <div className="stat-entry">
                    <div className="stat-entry__label"># Delegators:</div>
                    <div className="stat-entry__value">{delegatorsCount ?? "-"}</div>
                </div>
            </div>
        </div>
    );
};

export default LandingStatsSection;
