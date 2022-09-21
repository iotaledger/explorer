import React, { useState } from "react";
import { Link } from "react-router-dom";
import { RouteBuilder } from "../../../../helpers/routeBuilder";
import { INetwork } from "../../../../models/config/INetwork";
import { IFeedItem } from "../../../../models/feed/IFeedItem";
import { SettingsService } from "../../../../services/settingsService";
import FeedFilters from "./FeedFilters";
import "./BlockFeed.scss";

interface BlockFeedProps {
    networkConfig: INetwork;
    blocks: IFeedItem[];
    settingsService: SettingsService;
}

const BlockFeed: React.FC<BlockFeedProps> = ({ networkConfig, blocks, settingsService }) => {
    const [filteredBlocks, setFilteredBlocks] = useState(blocks);

    return (
        <>
            <div className="section--header row space-between padding-l-8">
                <h2 />
                <FeedFilters
                    networkConfig={networkConfig}
                    settingsService={settingsService}
                    items={blocks}
                    setFilteredItems={items => setFilteredBlocks(items)}
                />
            </div>
            <div className="feed-items">
                <div className="row feed-item--header">
                    <span className="label">Block id</span>
                    <span className="label">Payload Type</span>
                </div>
                {filteredBlocks.length === 0 && (
                    <p>There are no items with the current filter.</p>
                )}
                {filteredBlocks.map(item => (
                    <div className="feed-item" key={item.id}>
                        <div className="feed-item__content">
                            <span className="feed-item--label">Block id</span>
                            <Link
                                className="feed-item--hash"
                                to={RouteBuilder.buildItem(networkConfig, item.id)}
                            >
                                {item.id}
                            </Link>
                        </div>
                        <div className="feed-item__content">
                            <span className="feed-item--label">Payload Type</span>
                            <span className="feed-item--value payload-type">
                                {item.payloadType}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
};

export default BlockFeed;

