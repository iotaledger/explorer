import React from "react";
import { BaseTokenResponse } from "@iota/sdk-wasm-nova/web";

import "./CardInfo.scss";
import { formatAmount } from "~helpers/stardust/valueFormatHelper";
import CopyButton from "~app/components/CopyButton";
import Tooltip from "~app/components/Tooltip";

interface CardInfoDetail {
    title: string;
    amount?: number | string | null;
    onClickAmount?: () => void;
    copyAmount?: string;
}

interface CardInfoProps {
    /**
     * The title of the card.
     */
    title: string;
    tooltip?: string;
    amount?: number | string | null;
    tokenInfo: BaseTokenResponse;
    onClickAmount?: () => void;
    copyAmount?: string;
    details?: (CardInfoDetail | null)[];
}

export const CardInfo = ({ details, tooltip, title, amount, tokenInfo, onClickAmount = () => {}, copyAmount }: CardInfoProps) => {

    const detailsFiltered = details?.filter((i) => i !== null) as CardInfoDetail[] || [];

    return (
        <div className="card-info">
            <div className="card-info--header">
                <div className="card-info--header-title">
                    <div className="card-info--title">

                    {title}
                    </div>
                    {!!tooltip && (
                        <div className="card-info--tooltip">
                            <Tooltip tooltipContent={tooltip}>
                                <span className="material-icons">info</span>
                            </Tooltip>
                        </div>
                    )}
                </div>
                {!!amount && (
                    <div className="card-info--amount-wrap" onClick={onClickAmount}>
                        <div className="card-info--amount">{amount}</div>
                        {copyAmount && (
                            <div className="card-info--copy">
                                <CopyButton copy={copyAmount} />
                            </div>
                        )}
                    </div>
                )}
            </div>
            {!!detailsFiltered.length && (
                <div className="card-info--details">
                    <div className="card-info--details-divider"></div>
                    {detailsFiltered?.map((detail, idx) => (
                        <div key={idx + detail.title} className="card-info--detail">
                            <div className="card-info--detail-title">{detail.title}</div>
                            <div className="card-info--detail-amount" onClick={detail.onClickAmount}>
                                {detail.amount !== null ? detail.amount : "-"}
                                {detail.copyAmount && parseInt(detail.copyAmount) !== 0 && (
                                    <div className="card-info--copy">
                                        <CopyButton copy={detail.copyAmount} />
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
