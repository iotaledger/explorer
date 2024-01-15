import moment from "moment";
import { useEffect, useState } from "react";
import { useIsMounted } from "~helpers/hooks/useIsMounted";

export const useMilestoneInterval = (milestoneIndex: number | undefined) => {
    const isMounted = useIsMounted();
    const [from, setFrom] = useState<moment.Moment | undefined>();
    const [seconds, setSeconds] = useState<number | undefined>();

    useEffect(() => {
        setFrom(moment());
    }, [milestoneIndex]);

    useEffect(() => {
        const interval = setInterval(() => {
            const to = moment();
            const updatedSeconds = to.diff(from, "seconds", true);
            if (isMounted) {
                setSeconds(updatedSeconds);
            }
        }, 80);

        return () => {
            clearInterval(interval);
        };
    }, [from]);

    return seconds;
};
