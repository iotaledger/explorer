import React from "react";
import CopyButton from "~app/components/CopyButton";
import Tooltip from "~app/components/Tooltip";
import classNames from "classnames";

import "./CardInfo.scss";

export interface CardInfoDetail {
    title: string;
    value?: number | string | null;
    onClickValue?: () => void;
    copyValue?: string;
}

export interface CardInfoProps {
    /**
     * The title of the card.
     */
    title: string;
    tooltip?: string;
    value?: number | string | null;
    onClickValue?: () => void;
    copyValue?: string;
    details?: (CardInfoDetail | null)[];
    options?: {
        headerDirectionRow?: boolean;
    };
}

export const CardInfo = ({ options, details, tooltip, title, value, onClickValue = () => {}, copyValue }: CardInfoProps) => {
    const detailsFiltered = (details?.filter((i) => i !== null) as CardInfoDetail[]) || [];

    return (
        <div className="card-info">
            <div className={classNames("card-info--header", { "row middle space-between": !!options?.headerDirectionRow })}>
                <div className="card-info--header-title">
                    <div className="card-info__title">{title}</div>
                    {!!tooltip && (
                        <div className="card-info--tooltip">
                            <Tooltip tooltipContent={tooltip}>
                                <span className="material-icons">info</span>
                            </Tooltip>
                        </div>
                    )}
                </div>
                <div className="card-info__value-wrap" onClick={onClickValue}>
                    <div className="card-info__value">{value}</div>
                    {isValueNotZero(value) && !!copyValue && (
                        <div className="card-info__copy">
                            <CopyButton copy={String(copyValue)} />
                        </div>
                    )}
                </div>
            </div>
            {!!detailsFiltered.length && (
                <div className="card-info__details">
                    <div className="card-info__details-divider"></div>
                    {detailsFiltered?.map((detail, idx) => (
                        <div key={idx + detail.title} className="card-info__detail">
                            <div className="card-info__detail-title">{detail.title}</div>
                            <div className="card-info__detail-value" onClick={detail.onClickValue}>
                                {detail.value !== null ? detail.value : "-"}
                                {isValueNotZero(detail.value) && !!detail.copyValue && (
                                    <div className="card-info__copy">
                                        <CopyButton copy={String(detail.copyValue)} />
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

function isValueNotZero(value: number | string | null | undefined): boolean {
    if (typeof value === "number") {
        return value !== 0;
    } else if (typeof value === "string") {
        return parseFloat(value) !== 0;
    }
    return false;
}
