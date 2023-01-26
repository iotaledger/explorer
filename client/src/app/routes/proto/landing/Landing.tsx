import classNames from "classnames";
import React, { useState } from "react";
import { RouteComponentProps } from "react-router-dom";
import { ServiceFactory } from "../../../../factories/serviceFactory";
import { useBPSStream } from "../../../../helpers/proto/useBPSStream";
import { useGlobalMetrics } from "../../../../helpers/proto/useGlobalMetrics";
import { useStatusStream } from "../../../../helpers/proto/useStatusStream";
import { INetwork } from "../../../../models/config/INetwork";
import { CUSTOM } from "../../../../models/config/networkType";
import { STARDUST } from "../../../../models/config/protocolVersion";
import { NetworkService } from "../../../../services/networkService";
import AnalyticStats from "./AnalyticStats";
import EpochFeed from "./EpochFeed";
import InfoBox from "./InfoBox";
import "./Landing.scss";

export interface LandingProps {
    network: string;
}

const defaultNetworkConfig: INetwork = {
    label: "Custom network",
    network: CUSTOM,
    protocolVersion: STARDUST,
    isEnabled: false
};

const Landing: React.FC<RouteComponentProps<LandingProps>> = (
    { match: { params: { network } } }
) => {
    const [bps] = useBPSStream(network);
    const networkConfig = ServiceFactory.get<NetworkService>("network").get(network) ?? defaultNetworkConfig;
    const [status, lastEpochIndex, latestEpochIndices] = useStatusStream(network);
    const [globalMetrics] = useGlobalMetrics(network);

    return (
        <div className="landing-protonet">
            <div className={classNames("header-wrapper", { "protonet": true })}>
                <div className="inner">
                    <div className="header">
                        <div className="header--title">
                            <h2>{networkConfig.isEnabled ? "Explore network" : ""}</h2>
                            <div className="network-name"><h1>{networkConfig.label}</h1></div>
                        </div>
                        <InfoBox
                            bps={bps}
                            confLatency={globalMetrics?.confirmationDelay ?? "NA"}
                            inclusionRate={globalMetrics?.inclusionRate ?? 0}
                        />
                    </div>
                </div>
                <AnalyticStats globalMetrics={globalMetrics ?? undefined} />
            </div>
            <div className={classNames("wrapper feeds-wrapper", { "protonet": true })}>
                <div className="inner">
                    <div className="feeds-section">
                        <div className="row wrap feeds">
                            <div className="feed section">
                                <EpochFeed
                                    networkConfig={networkConfig}
                                    latestEpochIndices={latestEpochIndices}
                                    latestEpochIndex={lastEpochIndex}
                                    status={status ?? undefined}
                                />
                            </div>
                        </div>
                        <div className="card margin-t-m">
                            <div className="card--content description">{networkConfig.description}</div>
                            {networkConfig.faucet && (
                                <div className="card--content description">
                                    <span>Get tokens from the Faucet:</span>
                                    <a
                                        className="data-link margin-l-t"
                                        href={networkConfig.faucet}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        {networkConfig.faucet}
                                    </a>
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

export default Landing;

