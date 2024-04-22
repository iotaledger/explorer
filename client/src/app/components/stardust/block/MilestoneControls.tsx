import { MilestonePayload } from "@iota/sdk-wasm-stardust/web";
import React, { useContext, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { useMilestoneDetails } from "~helpers/stardust/hooks/useMilestoneDetails";
import { TransactionsHelper } from "~helpers/stardust/transactionsHelper";
import NetworkContext from "../../../context/NetworkContext";
import "./MilestoneControls.scss";

interface MilestoneControlProps {
    readonly milestone: MilestonePayload;
}

const MilestoneControls: React.FC<MilestoneControlProps> = ({ milestone }) => {
    const { name: network, protocolVersion } = useContext(NetworkContext);
    const history = useHistory();

    const [previousMsBlockId, setPreviousMsBlockId] = useState<string | undefined>();
    const [nextMsBlockId, setNextMsBlockId] = useState<string | undefined>();
    const [previousMsDetails] = useMilestoneDetails(network, milestone.index - 1);
    const [nextMsDetails] = useMilestoneDetails(network, milestone.index + 1);

    useEffect(() => {
        if (previousMsDetails?.milestone) {
            setPreviousMsBlockId(TransactionsHelper.blockIdFromMilestonePayload(protocolVersion, previousMsDetails.milestone));
        }
        if (nextMsDetails?.milestone) {
            setNextMsBlockId(TransactionsHelper.blockIdFromMilestonePayload(protocolVersion, nextMsDetails.milestone));
        }
    }, [nextMsDetails, previousMsDetails]);

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
