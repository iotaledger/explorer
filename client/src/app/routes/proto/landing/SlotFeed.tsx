import { IWsNodeStatus } from "@iota/protonet.js";
import React from "react";
import { INetwork } from "../../../../models/config/INetwork";
import Spinner from "../../../components/Spinner";
import ShortID, { LinkType } from "../ShortID";
import SlotFeedItem from "./SlotFeedItem";
import "./SlotFeed.scss";

interface SlotFeedProps {
    networkConfig: INetwork;
    latestSlotIndices: number[];
    latestSlotIndex?: number;
    status?: IWsNodeStatus;
}

const SlotFeed: React.FC<SlotFeedProps> = (
    { networkConfig, latestSlotIndices, latestSlotIndex, status }
) => {
    const network = networkConfig.network;

    return (
        <>
            <div className="section--header milestone-feed-header row">
                <h2>Latest Slots</h2>
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
                                /> : <Spinner />}
                        </div>
                    </div>
                </div>
                <div className="col fill margin-b-s">
                    <div className="section--data">
                        <div className="label">
                            Latest Confirmed Block
                        </div>
                        <div className="value swapIn" key={status?.tangleTime.confirmedBlockID}>
                            {status ?
                                <ShortID
                                    linkType={LinkType.Block} network={network}
                                    id={status?.tangleTime.confirmedBlockID ?? ""}
                                /> : <Spinner />}
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
                </div>
                {latestSlotIndices.length === 0 && (<Spinner />)}
                {latestSlotIndices.map(slotIndex => (
                    <SlotFeedItem
                        index={slotIndex}
                        network={network}
                        key={slotIndex}
                        isLatestSlot={slotIndex === latestSlotIndex}
                    />))}
            </div>
        </>
    );
};

SlotFeed.defaultProps = {
    latestSlotIndex: undefined,
    status: undefined
};

export default SlotFeed;

