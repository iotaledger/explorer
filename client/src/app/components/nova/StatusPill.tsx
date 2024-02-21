import React from "react";
import classNames from "classnames";
import { PillState } from "~/app/lib/ui/enums";
import "./StatusPill.scss";

interface IStatusPill {
    /**
     * Label for the status.
     */
    label: string;
    /**
     * The status of the pill.
     */
    state: PillState;
}

const StatusPill: React.FC<IStatusPill> = ({ label, state }): React.JSX.Element => (
    <>
        {label && (
            <div
                className={classNames("status-pill", {
                    status__confirmed: state === PillState.Confirmed,
                    status__conflicting: state === PillState.Rejected,
                    status__pending: state === PillState.Pending,
                })}
            >
                <span className="capitalize-text">{label}</span>
            </div>
        )}
    </>
);

export default StatusPill;
