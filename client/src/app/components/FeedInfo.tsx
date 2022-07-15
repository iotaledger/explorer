import moment from "moment";
import React, { useEffect, useState } from "react";
import "./FeedInfo.scss";

export interface FeedInfoProps {
    milestoneIndex?: number;
    frequencyTarget?: number;
    milestoneTimestamp?: number;
}

const FeedInfo: React.FC<FeedInfoProps> = ({ milestoneIndex, milestoneTimestamp, frequencyTarget }) => {
    const [seconds, setSeconds] = useState<number | undefined>(0);

    useEffect(() => {
        const interval = setInterval(() => {
            if (milestoneTimestamp !== 0) {
                const from = moment(milestoneTimestamp);
                const to = moment();
                const updatedSeconds = to.diff(from, "seconds");
                setSeconds(updatedSeconds);
            }
        }, 200);

        return () => {
            clearInterval(interval);
        };
    }, [milestoneIndex, milestoneTimestamp]);

    return (
        <div className="feed--metrics padding-l-8">
            <div className="latest-index">
                <h3>Latest Milestone:</h3>
                <span className="metrics-value margin-l-t">{milestoneIndex}</span>
            </div>
            {seconds !== undefined && (
                <div className="seconds">
                    <h3>Last{frequencyTarget ? " / Target" : ""}:</h3>
                    <span className="metrics-value margin-l-t">
                        {seconds}s{frequencyTarget ? ` / ${frequencyTarget}s` : ""}
                    </span>
                </div>
            )}
        </div>
    );
};

FeedInfo.defaultProps = {
    frequencyTarget: undefined,
    milestoneIndex: undefined,
    milestoneTimestamp: undefined
};

export default FeedInfo;
