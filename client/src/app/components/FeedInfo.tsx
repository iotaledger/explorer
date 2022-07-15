import moment from "moment";
import React, { useEffect, useState } from "react";
import "./FeedInfo.scss";

export interface FeedInfoProps {
    milestoneIndex?: number;
    frequencyTarget?: number;
    milestoneTimestamp?: number;
}

const FeedInfo: React.FC<FeedInfoProps> = ({ milestoneIndex, milestoneTimestamp, frequencyTarget }) => {
    const [from, setFrom] = useState<moment.Moment | undefined>(undefined);
    const [seconds, setSeconds] = useState<number | undefined>(undefined);

    useEffect(() => {
        const now = moment();
        // This is needed because clock seconds might not be synced around the world.
        setFrom(
            now.isBefore(moment(milestoneTimestamp)) ?
                now :
                moment(milestoneTimestamp)
        );
    }, [milestoneIndex, milestoneTimestamp]);

    useEffect(() => {
        const interval = setInterval(() => {
            if (milestoneTimestamp !== 0) {
                const to = moment();
                const updatedSeconds = to.diff(from, "seconds");
                setSeconds(updatedSeconds);
            }
        }, 400);

        return () => {
            clearInterval(interval);
        };
    }, [from]);

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
