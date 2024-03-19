import React from "react";
import LandingEpochSection from "~/app/components/nova/landing/LandingEpochSection";
import LandingSlotSection from "~/app/components/nova/landing/LandingSlotSection";
import { useNetworkInfoNova } from "~/helpers/nova/networkInfo";
import { useChronicleAnalytics } from "~/helpers/nova/hooks/useChronicleAnalytics";
import { useValidatorStats } from "~/helpers/nova/hooks/useValidatorStats";
import { useNetworkStats } from "~/helpers/nova/hooks/useNetworkStats";
import Hero from "~/app/components/Hero";
import { IStatDisplay } from "~/app/lib/interfaces";
import { formatAmount } from "~/helpers/stardust/valueFormatHelper";
import "./Landing.scss";

const Landing: React.FC = () => {
    const { name: network, tokenInfo } = useNetworkInfoNova((s) => s.networkInfo);
    const { chronicleAnalyticStats } = useChronicleAnalytics();
    const { validatorStats } = useValidatorStats();
    const { blocksPerSecond, confirmationRate } = useNetworkStats(network);
    const { validatorsSize, totalPoolStake, totalValidatorStake } = validatorStats ?? {};

    const accountsCount = chronicleAnalyticStats?.accountAddressesWithBalance ?? null;
    const delegatorsCount = chronicleAnalyticStats?.delegatorsCount ?? null;

    const totalDelegatedStake = totalPoolStake && totalValidatorStake ? BigInt(totalPoolStake) - BigInt(totalValidatorStake) : null;

    const networkStats: IStatDisplay[] = [
        {
            title: blocksPerSecond ?? "--",
            subtitle: "Blocks per sec",
        },
        {
            title: confirmationRate ? `${confirmationRate}%` : "--",
            subtitle: "Confirmation rate",
        },
    ];

    const assetsStats: IStatDisplay[] = [
        {
            title: accountsCount ?? "-",
            subtitle: "Accounts",
        },
        {
            title: validatorsSize !== undefined ? validatorsSize.toString() : "--",
            subtitle: "Validators",
        },
        {
            title: delegatorsCount ?? "-",
            subtitle: "Delegators",
        },
        {
            title: `${totalValidatorStake !== undefined ? formatAmount(totalValidatorStake, tokenInfo) : "--"}`,
            subtitle: "Total Staked",
        },
        {
            title: `${totalDelegatedStake !== null ? formatAmount(totalDelegatedStake, tokenInfo) : "--"}`,
            subtitle: "Total Delegated",
        },
    ];

    return (
        <div className="landing-nova">
            <Hero network={network} overline="Explore network" networkStats={networkStats} assetStats={assetsStats} />
            <div className="wrapper">
                <div className="inner">
                    <LandingEpochSection />
                    <LandingSlotSection />
                </div>
            </div>
        </div>
    );
};

export default Landing;
