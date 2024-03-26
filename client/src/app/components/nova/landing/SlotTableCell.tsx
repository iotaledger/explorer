import { SlotStatus } from "~/app/lib/enums";
import { PillStatus } from "~/app/lib/ui/enums";
import React from "react";
import StatusPill from "../StatusPill";
import TruncatedId from "../../stardust/TruncatedId";
import classNames from "classnames";

export enum SlotTableCellType {
    StatusPill = "status-pill",
    Link = "link",
    Text = "text",
    TruncatedId = "truncated-id",
    Empty = "empty",
}

export type TSlotTableData = IPillStatusCell | ITextCell | ILinkCell | ITruncatedIdCell | IEmptyCell;

export default function SlotTableCellWrapper(cellData: TSlotTableData): React.JSX.Element {
    let Component: React.JSX.Element;

    switch (cellData.type) {
        case SlotTableCellType.StatusPill:
            Component = <PillStatusCell {...cellData} />;
            break;
        case SlotTableCellType.Link:
            Component = <LinkCell {...cellData} />;
            break;
        case SlotTableCellType.TruncatedId:
            Component = <TruncatedIdCell {...cellData} />;
            break;
        case SlotTableCellType.Empty:
            Component = <EmptyCell {...cellData} />;
            break;
        default: {
            Component = <TextCell {...cellData} />;
            break;
        }
    }

    return Component;
}

interface IPillStatusCell {
    data: string;
    type: SlotTableCellType.StatusPill;
}

function PillStatusCell({ data }: IPillStatusCell): React.JSX.Element {
    let status: PillStatus = PillStatus.Pending;

    if (data === SlotStatus.Committed || data === SlotStatus.Finalized) {
        status = PillStatus.Success;
    }

    return (
        <div className="status-cell">
            <StatusPill status={status} label={data} />
        </div>
    );
}

interface ILinkCell {
    data: string;
    type: SlotTableCellType.Link;
    href: string;
}

function LinkCell({ data, href }: ILinkCell): React.JSX.Element {
    return <a href={href}>{data}</a>;
}

interface ITextCell {
    data: string;
    type: SlotTableCellType.Text;
    highlight?: boolean;
}

function TextCell({ data, highlight }: ITextCell): React.JSX.Element {
    return <span className={classNames({ highlight })}>{data}</span>;
}

interface ITruncatedIdCell {
    data: string;
    type: SlotTableCellType.TruncatedId;
    href: string;
}

function TruncatedIdCell({ data, href }: ITruncatedIdCell): React.JSX.Element {
    return (
        <div className="slot-id">
            <TruncatedId id={data} link={href} />
        </div>
    );
}

interface IEmptyCell {
    type: SlotTableCellType.Empty;
}

function EmptyCell({ type }: IEmptyCell): React.JSX.Element {
    return <div></div>;
}
