import classNames from "classnames";
import React from "react";
import { RouteComponentProps } from "react-router-dom";
import { ServiceFactory } from "../../../../factories/serviceFactory";
import BigDecimal from "../../../../helpers/bigDecimal";
import { useBPSStream } from "../../../../helpers/proto/useBPSStream";
import { useGlobalMetrics } from "../../../../helpers/proto/useGlobalMetrics";
import { useStatusStream } from "../../../../helpers/proto/useStatusStream";
import { INetwork } from "../../../../models/config/INetwork";
import { CUSTOM } from "../../../../models/config/networkType";
import { STARDUST } from "../../../../models/config/protocolVersion";
import { NetworkService } from "../../../../services/networkService";
import AnalyticStats from "./AnalyticStats";
import InfoBox from "./InfoBox";
import SlotFeed from "./SlotFeed";
import "./Landing.scss";

interface LandingProps {
    network: string;
}

const defaultNetworkConfig: INetwork = {
    label: "Custom network",
    network: CUSTOM,
    protocolVersion: STARDUST,
    isEnabled: false,
    hasStatisticsSupport: false
};

const Landing: React.FC<RouteComponentProps<LandingProps>> = (
    { match: { params: { network } } }
) => {
    const [bps] = useBPSStream();
    const networkConfig = ServiceFactory.get<NetworkService>("network").get(network) ?? defaultNetworkConfig;
    const [status, lastSlotIndex, latestSlotIndices] = useStatusStream();
    const [globalMetrics] = useGlobalMetrics(network);

    const inclusionRate = globalMetrics?.inclusionRate ?
        new BigDecimal(globalMetrics.inclusionRate.toString()).toString() :
        "0";

    return (
        <div className="landing-protonet">
            <div className="header-wrapper protonet">
                <div className="inner">
                    <div className="header">
                        <div className="header--title">
                            <h2>{networkConfig.isEnabled ? "Explore network" : ""}</h2>
                            <div className="network-name"><h1>{networkConfig.label}</h1></div>
                        </div>
                        <InfoBox
                            confLatency={globalMetrics?.confirmationDelay ?? "NA"}
                            bps={bps}
                            inclusionRate={inclusionRate}
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
                                <SlotFeed
                                    networkConfig={networkConfig}
                                    latestSlotIndices={latestSlotIndices}
                                    latestSlotIndex={lastSlotIndex}
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

