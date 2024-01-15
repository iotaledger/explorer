import classNames from "classnames";
import React, { useContext } from "react";
import { RouteComponentProps } from "react-router-dom";
import AnalyticStats from "./AnalyticStats";
import InfoBox from "./InfoBox";
import MilestoneFeed from "./MilestoneFeed";
import { useBlockFeed } from "~helpers/stardust/hooks/useBlockFeed";
import { useChronicleAnalytics } from "~helpers/stardust/hooks/useChronicleAnalytics";
import { useCurrencyService } from "~helpers/stardust/hooks/useCurrencyService";
import { useNetworkConfig } from "~helpers/hooks/useNetworkConfig";
import { useNetworkStats } from "~helpers/stardust/hooks/useNetworkStats";
import { isShimmerUiTheme } from "~helpers/networkHelper";
import NetworkContext from "../../../context/NetworkContext";
import { LandingRouteProps } from "../../LandingRouteProps";
import "./Landing.scss";

export const Landing: React.FC<RouteComponentProps<LandingRouteProps>> = ({
    match: {
        params: { network },
    },
}) => {
    const { tokenInfo } = useContext(NetworkContext);
    const [milestones, latestMilestoneIndex] = useBlockFeed(network);
    const [networkConfig] = useNetworkConfig(network);
    const [blocksPerSecond, , confirmedBlocksPerSecondPercent] = useNetworkStats(network);
    const [networkAnalytics] = useChronicleAnalytics(network);
    const [price, marketCap] = useCurrencyService(network === "mainnet");

    const isShimmer = isShimmerUiTheme(networkConfig?.uiTheme);

    return (
        <div className="landing-stardust">
            <div className={classNames("header-wrapper", { shimmer: isShimmer }, { iota: !isShimmer })}>
                <div className="inner">
                    <div className="header">
                        <div className="header--title">
                            <h2>{networkConfig.isEnabled ? "Explore network" : ""}</h2>
                            <div className="network-name">
                                <h1>{networkConfig.label}</h1>
                            </div>
                        </div>
                        <InfoBox
                            baseToken={tokenInfo.unit}
                            itemsPerSecond={blocksPerSecond}
                            confirmedItemsPerSecondPercent={confirmedBlocksPerSecondPercent}
                            marketCapCurrency={marketCap}
                            priceCurrency={price}
                            showMarket={networkConfig.showMarket ?? false}
                        />
                    </div>
                </div>
                <AnalyticStats analytics={networkAnalytics} circulatingSupply={networkConfig.circulatingSupply} tokenInfo={tokenInfo} />
            </div>
            <div className={classNames("wrapper feeds-wrapper")}>
                <div className="inner">
                    <div className="feeds-section">
                        <div className="row wrap feeds">
                            <div className="feed section">
                                <MilestoneFeed
                                    networkConfig={networkConfig}
                                    milestones={milestones}
                                    latestMilestoneIndex={latestMilestoneIndex ?? undefined}
                                />
                            </div>
                        </div>
                        <div className="card margin-t-m">
                            <div className="card--content description">{networkConfig.description}</div>
                            {networkConfig.faucet && (
                                <div className="card--content faucet">
                                    <span>
                                        Get tokens from the{" "}
                                        <a className="data-link link" href={networkConfig.faucet} target="_blank" rel="noopener noreferrer">
                                            Faucet
                                        </a>
                                    </span>
                                </div>
                            )}
                        </div>
                        {!networkConfig.isEnabled && (
                            <div className="card margin-t-m">
                                <div className="card--content description">
                                    {networkConfig.isEnabled === undefined
                                        ? "This network is not recognised."
                                        : "This network is currently disabled in explorer."}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
