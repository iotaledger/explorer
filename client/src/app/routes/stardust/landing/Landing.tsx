import classNames from "classnames";
import React, { useContext } from "react";
import { RouteComponentProps } from "react-router-dom";
import InfoBox from "./InfoBox";
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
    const [networkConfig] = useNetworkConfig(network);
    const [blocksPerSecond, , confirmedBlocksPerSecondPercent] = useNetworkStats(network);
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
            </div>
            <div className={classNames("wrapper feeds-wrapper")}>
                <div className="inner">
                    <div className="feeds-section">
                        <div className="card margin-t-m">
                            <div className="card--value card--value__no-margin description col row middle" style={{ whiteSpace: "nowrap" }}>
                                <p>
                                    <span>This network is superseded by </span>
                                    {/* TODO: Set proper link */}
                                    <a href="https://explorer.rebased.iota.org" target="_blank" rel="noopener noreferrer">
                                        Mainnet (rebased)
                                    </a>
                                    .
                                </p>
                                <p>
                                    {/* TODO: Add exact Milestone */}
                                    <span>It can only be used to browse historic data before milestone XYZ</span>
                                </p>
                            </div>
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
