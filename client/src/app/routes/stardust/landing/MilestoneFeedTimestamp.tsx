import React from "react";
import { DateHelper } from "../../../../helpers/dateHelper";
import { useMilestoneInterval } from "../../../../helpers/hooks/useMilestoneInterval";
import Tooltip from "../../../components/Tooltip";

interface MilestoneFeedTimestampProps {
    timestamp: number;
    showMilliseconds: boolean;
}

const MilestoneFeedTimestamp: React.FC<MilestoneFeedTimestampProps> = ({ timestamp, showMilliseconds }) => {
    const secondsSinceLast = useMilestoneInterval(undefined, timestamp, showMilliseconds);
    const secondsSinceLastView = secondsSinceLast ? (
        <span className="seconds">{secondsSinceLast}s ago</span>
    ) : "";
    const tooltipContent = DateHelper.formatShort(timestamp);

    return (
        <div className="feed-item__content">
            <span className="feed-item--label">Timestamp</span>
            <span className="feed-item--value ms-timestamp">
                <Tooltip
                    tooltipContent={tooltipContent}
                >
                    {secondsSinceLastView}
                </Tooltip>
            </span>
        </div>
    );
};

export default MilestoneFeedTimestamp;

