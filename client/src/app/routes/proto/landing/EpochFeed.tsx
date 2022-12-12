import { IWsNodeStatus } from "@iota/protonet.js";
import React from "react";
import { useMilestoneInterval } from "../../../../helpers/hooks/useMilestoneInterval";
import { INetwork } from "../../../../models/config/INetwork";
import Spinner from "../../../components/Spinner";
import "./EpochFeed.scss";
import ShortID, { LinkType } from "../ShortID";
import EpochFeedItem from "./EpochFeedItem";

// const FEED_ITEMS_MAX = 10;

interface EpochFeedProps {
    networkConfig: INetwork;
    latestEpochIndices: number[];
    latestEpochIndex?: number;
    status?: IWsNodeStatus;
}

const EpochFeed: React.FC<EpochFeedProps> = (
    { networkConfig, latestEpochIndices, latestEpochIndex, status }
) => {
    const network = networkConfig.network;

    return (
        <>
            <div className="section--header milestone-feed-header row">
                <h2>Latest Epochs</h2>
            </div>
            <div className="row row--tablet-responsive fill">
                <div className="col fill margin-b-s">
                    <div className="section--data">
                        <div className="label">
                            Latest Accepted Block
                        </div>
                        <div className="value swapIn" key={status?.tangleTime.acceptedBlockID}>
                            {status ?
                                <ShortID
                                    linkType={LinkType.Block} network={network}
                                    id={status?.tangleTime.acceptedBlockID ?? ""}
                                />
                                :
                                <Spinner />}
                        </div>
                    </div>
                </div>
                <div className="col fill margin-b-s">
                    <div className="section--data">
                        <div className="label">Latest Confirmed Block</div>
                        <div className="value swapIn" key={status?.tangleTime.confirmedBlockID}>
                            {status ?
                                <ShortID
                                    linkType={LinkType.Block} network={network}
                                    id={status?.tangleTime.confirmedBlockID ?? ""}
                                />
                                :
                                <Spinner />}
                        </div>
                    </div>
                </div>
                <div className="col fill margin-b-s" />
            </div>
            <div className="feed-items">
                <div className="row feed-item--header ms-feed">
                    <span className="label ms-index">Index</span>
                    <span className="label ms-id">ID</span>
                    <span className="label ms-blocks">Blocks</span>
                    <span className="label ms-txs">Txs</span>
                    <span className="label ms-timestamp">Timestamp</span>
                </div>
                {latestEpochIndices.length === 0 && (<Spinner />)}
                {latestEpochIndices.map(epochIndex => (
                    <EpochFeedItem
                        index={epochIndex} network={network} key={epochIndex}
                        isLatestEpoch={epochIndex === latestEpochIndex} latestEpochIndex={latestEpochIndex ?? 0}
                    />))}
            </div>
        </>
    );
};

EpochFeed.defaultProps = {
    latestEpochIndex: undefined,
    status: undefined
};

export default EpochFeed;
