import React from "react";
import LandingStatsSection from "~/app/components/nova/landing/LandingStatsSection";
import LandingEpochSection from "~/app/components/nova/landing/LandingEpochSection";
import LandingSlotSection from "~/app/components/nova/landing/LandingSlotSection";
import { useNetworkInfoNova } from "~/helpers/nova/networkInfo";
import { useChronicleAnalytics } from "~/helpers/nova/hooks/useChronicleAnalytics";
import { useValidatorStats } from "~/helpers/nova/hooks/useValidatorStats";
import { useNetworkStats } from "~/helpers/nova/hooks/useNetworkStats";
import Hero from "~/app/components/Hero";
import { IStatDisplay } from "~/app/lib/interfaces";
import { StatDisplaySize } from "~/app/lib/enums";
import BigDecimal from "~/helpers/bigDecimal";
import "./Landing.scss";

const Landing: React.FC = () => {
    const { name: network, protocolInfo } = useNetworkInfoNova((s) => s.networkInfo);
    const { chronicleAnalyticStats } = useChronicleAnalytics();
    const { validatorStats } = useValidatorStats();
    const { blocksPerSecond, confirmationRate } = useNetworkStats(network);
    const { validatorsSize, totalPoolStake, totalValidatorStake } = validatorStats ?? {};

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

    const networkStats: IStatDisplay[] = [
        {
            title: blocksPerSecond ?? "-",
            subtitle: "Blocks per sec",
        },
        {
            title: confirmationRate ? `${confirmationRate}%` : "-",
            subtitle: "Confirmation rate",
        },
        {
            title: delegatorsCount ?? "-",
            subtitle: "Delegators",
        },
        {
            title: validatorsSize !== undefined ? validatorsSize.toString() : "-",
            subtitle: "Validators",
        },
    ];

    const assetsStats: IStatDisplay[] = [
        {
            title: accountsCount ?? "-",
            subtitle: "Accounts",
            size: StatDisplaySize.Small,
        },
        {
            title: `${percentStaked}%`,
            subtitle: "Total Staked",
            size: StatDisplaySize.Small,
        },
        {
            title: `${percentDelegated}%`,
            subtitle: "Total Delegated",
            size: StatDisplaySize.Small,
        },
    ];

    return (
        <div className="landing-nova">
            <Hero network={network} overline="Explore network" networkStats={networkStats} assetStats={assetsStats} />
            <div className="wrapper">
                <div className="inner">
                    <LandingStatsSection />
                    <LandingEpochSection />
                    <LandingSlotSection />
                </div>
            </div>
        </div>
    );
};

export default Landing;
