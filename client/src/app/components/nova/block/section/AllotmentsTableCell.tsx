import React from "react";
import TruncatedId from "../../../stardust/TruncatedId";
import classNames from "classnames";

export enum AllotmentTableCellType {
    Text = "text",
    TruncatedId = "truncated-id",
}

export type TAllotmentsTableData = ITextCell | ITruncatedIdCell;

export default function AllotmentsTableCellWrapper(cellData: TAllotmentsTableData): React.JSX.Element {
    let Component: React.JSX.Element;

    switch (cellData.type) {
        case AllotmentTableCellType.TruncatedId:
            Component = <TruncatedIdCell {...cellData} />;
            break;
        default: {
            Component = <TextCell {...cellData} />;
            break;
        }
    }

    return Component;
}

interface ITextCell {
    data: string;
    type: AllotmentTableCellType.Text;
    highlight?: boolean;
}

function TextCell({ data, highlight }: ITextCell): React.JSX.Element {
    return <span className={classNames({ highlight })}>{data}</span>;
}

interface ITruncatedIdCell {
    data: string;
    type: AllotmentTableCellType.TruncatedId;
    href: string;
}

function TruncatedIdCell({ data, href }: ITruncatedIdCell): React.JSX.Element {
    return (
        <div className="allotment-id">
            <TruncatedId id={data} link={href} />
        </div>
    );
}
