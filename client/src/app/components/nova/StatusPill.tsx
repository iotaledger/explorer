import classNames from "classnames";
import React from "react";
import "./StatusPill.scss";

export enum PillStatus {
    /**
     * The status is pending.
     */
    Pending = "pending",

    /**
     * The status is confirmed.
     */
    Confirmed = "confirmed",

    /**
     * The status is rejected.
     */
    Rejected = "rejected",
}

interface IStatusPill {
    /**
     * Label for the status.
     */
    label: string;
    /**
     * The status of the pill.
     */
    status: PillStatus;
}

const StatusPill: React.FC<IStatusPill> = ({ label, status }) => (
    <div className="status-pill">
        {status && (
            <div
                className={classNames(
                    {
                        status__confirmed: status === PillStatus.Confirmed,
                    },
                    {
                        status__conflicting: status === PillStatus.Rejected,
                    },
                    { status__pending: status === PillStatus.Pending },
                )}
            >
                <span className="capitalize-text">{label}</span>
            </div>
        )}
    </div>
);

export default StatusPill;
