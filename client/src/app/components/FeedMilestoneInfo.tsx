import React from "react";
import { useMilestoneInterval } from "~helpers/stardust/hooks/useMilestoneInterval";
import "./FeedMilestoneInfo.scss";

interface FeedMilestoneInfoProps {
    readonly milestoneIndex?: number;
    readonly frequencyTarget?: number;
}

const FeedMilestoneInfo: React.FC<FeedMilestoneInfoProps> = ({ milestoneIndex, frequencyTarget }) => {
    const secondsSinceLast = useMilestoneInterval(milestoneIndex);

    return (
        <div className="feed--metrics padding-l-8">
            <div className="latest-index">
                <h3>Latest Milestone:</h3>
                <span className="metrics-value margin-l-t">{milestoneIndex}</span>
            </div>
            {secondsSinceLast !== undefined && (
                <div className="seconds">
                    <h3>Last{frequencyTarget ? " / Target" : ""}:</h3>
                    <span className="metrics-value margin-l-t">
                        {secondsSinceLast.toFixed(2)} s{frequencyTarget ? ` / ${frequencyTarget} s` : ""}
                    </span>
                </div>
            )}
        </div>
    );
};

FeedMilestoneInfo.defaultProps = {
    frequencyTarget: undefined,
    milestoneIndex: undefined,
};

export default FeedMilestoneInfo;
