import { blockIdFromMilestonePayload, IMilestonePayload } from "@iota/iota.js-stardust";
import React, { useContext, useEffect, useRef, useState } from "react";
import { useHistory } from "react-router-dom";
import { ServiceFactory } from "../../../factories/serviceFactory";
import { STARDUST } from "../../../models/config/protocolVersion";
import { StardustTangleCacheService } from "../../../services/stardust/stardustTangleCacheService";
import NetworkContext from "../../context/NetworkContext";
import "./MilestoneControls.scss";

interface MilestoneControlProps {
    milestone: IMilestonePayload;
}

const MilestoneControls: React.FC<MilestoneControlProps> = ({ milestone }) => {
    const isMounted = useRef(false);
    const { name: network, protocolVersion } = useContext(NetworkContext);
    const history = useHistory();
    const [tangleCacheService] = useState(
        ServiceFactory.get<StardustTangleCacheService>(`tangle-cache-${STARDUST}`)
    );
    const [checkNextMSTimerId, setCheckNextMSTimerId] = useState<NodeJS.Timer | null>(null);
    const [previousMsBlockId, setPreviousMsBlockId] = useState<string | undefined>();
    const [nextMsBlockId, setNextMsBlockId] = useState<string | undefined>();

    useEffect(() => {
        isMounted.current = true;
        // eslint-disable-next-line no-void
        void checkForAdjacentMilestones();
        return () => {
            if (checkNextMSTimerId) {
                clearTimeout(checkNextMSTimerId);
                setCheckNextMSTimerId(null);
            }
            isMounted.current = false;
        };
    }, [milestone, network]);

    /**
     * Check for the previous and next milestones.
     */
    async function checkForAdjacentMilestones(): Promise<void> {
        if (milestone) {
            const nextIndex = milestone.index + 1;
            const previousIndex = milestone.index - 1;
            let maybePreviousMsBlockId: string | undefined;
            let maybeNextMsBlockId: string | undefined;

            if (previousIndex > 0) {
                const resultPrevious = await tangleCacheService.milestoneDetails(network, previousIndex);
                if (resultPrevious.milestone) {
                    maybePreviousMsBlockId = blockIdFromMilestonePayload(protocolVersion, resultPrevious.milestone);
                }
            }

            const resultNext = await tangleCacheService.milestoneDetails(network, nextIndex);

            if (resultNext.milestone) {
                maybeNextMsBlockId = blockIdFromMilestonePayload(protocolVersion, resultNext.milestone);
            }

            setPreviousMsBlockId(maybePreviousMsBlockId);
            setNextMsBlockId(maybeNextMsBlockId);

            if (!maybeNextMsBlockId) {
                const timerId = setTimeout(async () => checkForAdjacentMilestones(), 5000);
                setCheckNextMSTimerId(timerId);
            } else {
                setCheckNextMSTimerId(null);
            }
        }
    }

    return (
        <div className="milestone-controls row space-between">
            {(previousMsBlockId || nextMsBlockId) && (
                <div className="section--data row middle">
                    <button
                        className="milestone-controls__action margin-r-t"
                        type="button"
                        disabled={!previousMsBlockId}
                        onClick={() => history?.push(`/${network}/block/${previousMsBlockId}`)}
                    >
                        <span>Previous</span>
                    </button>
                    <button
                        className="milestone-controls__action margin-r-t"
                        type="button"
                        disabled={!nextMsBlockId}
                        onClick={() => history?.push(`/${network}/block/${nextMsBlockId}`)}
                    >
                        <span>Next</span>
                    </button>
                </div>
            )}
        </div>
    );
};

export default MilestoneControls;

