import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import "./EpochControls.scss";
import { useNetworkInfoNova } from "~/helpers/nova/networkInfo";

interface EpochControlProps {
    readonly epochIndex: number;
    readonly isFutureEpoch?: boolean;
}

const EpochControls: React.FC<EpochControlProps> = ({ epochIndex, isFutureEpoch = false }) => {
    const { name: network } = useNetworkInfoNova((s) => s.networkInfo);
    const history = useHistory();
    const [previousEpochIndex, setPreviousEpochIndex] = useState<number | null>(null);
    const [nextEpochIndex, setNextEpochIndex] = useState<number | null>(null);

    useEffect(() => {
        if (epochIndex === 0) {
            setPreviousEpochIndex(null);
            setNextEpochIndex(epochIndex + 1);
        } else {
            setPreviousEpochIndex(epochIndex - 1);
            setNextEpochIndex(epochIndex + 1);
        }
    }, [epochIndex]);

    return (
        <div className="milestone-controls row space-between">
            {(previousEpochIndex || nextEpochIndex) && (
                <div className="section--data row middle">
                    <button
                        className="milestone-controls__action margin-r-t"
                        type="button"
                        disabled={previousEpochIndex === null}
                        onClick={() => history?.push(`/${network}/epoch/${previousEpochIndex}`)}
                    >
                        <span>Previous</span>
                    </button>
                    <button
                        className="milestone-controls__action margin-r-t"
                        type="button"
                        disabled={nextEpochIndex === null || isFutureEpoch}
                        onClick={() => history?.push(`/${network}/epoch/${nextEpochIndex}`)}
                    >
                        <span>Next</span>
                    </button>
                </div>
            )}
        </div>
    );
};

export default EpochControls;
