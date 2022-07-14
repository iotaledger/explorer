import React from "react";
import { FeedInfoProps } from "./FeedInfoProps";
import "./FeedInfo.scss";

const FeedInfo: React.FC<FeedInfoProps> = (
    { latestMilestoneIndex, secondsSinceLastMilestone, milestoneFrequencyTarget }) => (
        <div className="feed--metrics padding-l-8">
            <div className="latest-index">
                <h3>Latest Milestone:</h3>
                <span className="metrics-value margin-l-t">{latestMilestoneIndex}</span>
            </div>
            {secondsSinceLastMilestone !== undefined && (
                milestoneFrequencyTarget ?
                    <div className="seconds">
                        <h3>Last & Target:</h3>
                        <span className="metrics-value margin-l-t">
                            {secondsSinceLastMilestone}s / {
                            milestoneFrequencyTarget
                        }s
                        </span>
                    </div> :
                    <div className="seconds">
                        <h3>Last:</h3>
                        <span className="metrics-value margin-l-t">
                            {secondsSinceLastMilestone}s
                        </span>
                    </div>
            )}
        </div>
    );

export default FeedInfo;
