import classNames from "classnames";
import React from "react";
import { PillStatus } from "~/app/lib/ui/enums";
import Tooltip from "../Tooltip";
import "./StatusPill.scss";

interface IStatusPill {
    /**
     * Label for the status.
     */
    label: string;
    /**
     * The status of the pill.
     */
    status: PillStatus;
    /**
     * Tooltip explaining further for the label.
     */
    tooltip?: string;
}

const StatusPill: React.FC<IStatusPill> = ({ label, status, tooltip }): React.JSX.Element => (
    <>
        <div
            className={classNames("status-pill", {
                status__success: status === PillStatus.Success,
                status__error: status === PillStatus.Error,
                status__pending: status === PillStatus.Pending,
            })}
        >
            {tooltip ? (
                <Tooltip tooltipContent={tooltip}>
                    <span className="capitalize-text">{status}</span>
                </Tooltip>
            ) : (
                <span className="capitalize-text">{label}</span>
            )}
        </div>
    </>
);

export default StatusPill;
