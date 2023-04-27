import moment from "moment";
import { useEffect, useState } from "react";
import { useIsMounted } from "./useIsMounted";

export const useMilestoneInterval = (milestoneIndex?: number, timestamp?: number, precise?: boolean) => {
    const isMounted = useIsMounted();
    const [from, setFrom] = useState<moment.Moment | undefined>();
    const [seconds, setSeconds] = useState<number | undefined>();

    useEffect(() => {
        setFrom(moment(timestamp).startOf("second"));
    }, [timestamp]);

    useEffect(() => {
        setFrom(moment());
    }, [milestoneIndex]);

    useEffect(() => {
        const interval = setInterval(() => {
            const to = moment();
            let updatedSeconds = to.diff(from, "seconds", precise ?? true);
            if (precise) {
                updatedSeconds = Number(updatedSeconds.toFixed(2));
            }
            if (isMounted) {
                setSeconds(updatedSeconds);
            }
        }, 80);

        return () => {
            clearInterval(interval);
        };
    }, [from, precise]);

    return seconds;
};

