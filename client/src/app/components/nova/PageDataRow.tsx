import React, { useState } from "react";
import classNames from "classnames";
import TruncatedId from "../stardust/TruncatedId";
import { BaseTokenResponse } from "@iota/sdk-wasm-nova/web";
import { formatAmount } from "~/helpers/stardust/valueFormatHelper";

export interface IPageDataRow {
    label: string;
    value?: string | number;
    highlight?: boolean;
    truncatedId?: {
        id: string;
        link?: string;
        showCopyButton?: boolean;
    };
    tokenInfo?: BaseTokenResponse;
}
const PageDataRow = ({ label, value, truncatedId, highlight, tokenInfo }: IPageDataRow): React.JSX.Element => {
    const [isFormatBalance, setIsFormatBalance] = useState(true);

    const renderValue = () => {
        if (truncatedId) {
            return <TruncatedId id={truncatedId.id} link={truncatedId.link} showCopyButton={truncatedId.showCopyButton} />;
        } else if (tokenInfo && value) {
            return (
                <span onClick={() => setIsFormatBalance(!isFormatBalance)} className="pointer margin-r-5">
                    {formatAmount(value ?? 0, tokenInfo, isFormatBalance)}
                </span>
            );
        } else {
            return value;
        }
    };

    return (
        <div className="section--data">
            <div className="label">{label}</div>
            <div className={classNames("value code", { highlight })}>{renderValue()}</div>
        </div>
    );
};

export default PageDataRow;
