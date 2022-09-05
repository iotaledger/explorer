import moment from "moment";
import React, { useEffect, useState } from "react";
import "./FeedMilestoneInfo.scss";

interface FeedMilestoneInfoProps {
    milestoneIndex?: number;
    frequencyTarget?: number;
}

const FeedMilestoneInfo: React.FC<FeedMilestoneInfoProps> = ({ milestoneIndex, frequencyTarget }) => {
    const [from, setFrom] = useState<moment.Moment | undefined>();
    const [seconds, setSeconds] = useState<number | undefined>();

    useEffect(() => {
        setFrom(moment());
    }, [milestoneIndex]);

    useEffect(() => {
        const interval = setInterval(() => {
            const to = moment();
            const updatedSeconds = to.diff(from, "seconds", true);
            setSeconds(updatedSeconds);
        }, 80);

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
                        {seconds.toFixed(2)} s{frequencyTarget ? ` / ${frequencyTarget} s` : ""}
                    </span>
                </div>
            )}
        </div>
    );
};

FeedMilestoneInfo.defaultProps = {
    frequencyTarget: undefined,
    milestoneIndex: undefined
};

export default FeedMilestoneInfo;
