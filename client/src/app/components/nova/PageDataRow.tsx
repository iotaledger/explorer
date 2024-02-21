import React from "react";
import classNames from "classnames";
import TruncatedId from "../stardust/TruncatedId";

export interface IPageDataRow {
    label: string;
    value?: string | number;
    highlighted?: boolean;
    truncatedId?: {
        id: string;
        link?: string;
        showCopyButton?: boolean;
    };
}
const PageDataRow = ({ label, value, truncatedId, highlighted }: IPageDataRow): React.JSX.Element => {
    return (
        <div className="section--data">
            <div className="label">{label}</div>
            <div className={classNames("value code", { highlighted })}>
                {truncatedId ? (
                    <TruncatedId id={truncatedId.id} link={truncatedId.link} showCopyButton={truncatedId.showCopyButton} />
                ) : (
                    value
                )}
            </div>
        </div>
    );
};

export default PageDataRow;
