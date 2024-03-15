import { SlotStatus } from "~/app/lib/enums";
import { PillStatus } from "~/app/lib/ui/enums";
import React from "react";
import StatusPill from "../StatusPill";
import TruncatedId from "../../stardust/TruncatedId";
import classNames from "classnames";

export enum SlotTableData {
    StatusPill = "status-pill",
    Link = "link",
    Text = "text",
    TextHighlight = "text-highlight",
    TruncatedId = "truncated-id",
    Empty = "empty",
}

export type TSlotTableCell = IPillStatusCell | ITextCell | ILinkCell | ITruncatedIdCell | IEmptyCell;

export default function SlotTableCellWrapper(cellData: TSlotTableCell): React.JSX.Element {
    let Component: React.JSX.Element;

    switch (cellData.type) {
        case SlotTableData.StatusPill:
            Component = <PillStatusCell data={cellData.data} />;
            break;
        case SlotTableData.Link:
            Component = <LinkCell data={cellData.data} href={cellData.href} />;
            break;
        case SlotTableData.TruncatedId:
            Component = <TruncatedIdCell data={cellData.data} href={cellData.href} />;
            break;
        case SlotTableData.Empty:
            Component = <EmptyCell />;
            break;
        default: {
            Component = <TextCell data={cellData.data} type={cellData.type} />;
            break;
        }
    }

    return Component;
}

interface IPillStatusCell {
    data: string;
    type: SlotTableData.StatusPill;
}

function PillStatusCell({ data }: { data: string }): React.JSX.Element {
    let status: PillStatus = PillStatus.Pending;

    if (data === SlotStatus.Committed || data === SlotStatus.Finalized) {
        status = PillStatus.Success;
    }

    return (
        <div className="flex">
            <StatusPill status={status} label={data} />
        </div>
    );
}

interface ILinkCell {
    data: string;
    type: SlotTableData.Link;
    href: string;
}

function LinkCell({ data, href }: { data: string; href: string }): React.JSX.Element {
    return <a href={href}>{data}</a>;
}

interface ITextCell {
    data: string;
    type: SlotTableData.Text | SlotTableData.TextHighlight;
}

function TextCell({ data, type }: { data: string; type: SlotTableData.Text | SlotTableData.TextHighlight }): React.JSX.Element {
    const isHighlighted = type === SlotTableData.TextHighlight;
    return <span className={classNames({ highligh: isHighlighted })}>{data}</span>;
}

interface ITruncatedIdCell {
    data: string;
    type: SlotTableData.TruncatedId;
    href: string;
}

function TruncatedIdCell({ data, href }: { data: string; href: string }): React.JSX.Element {
    return (
        <div className="slot-id">
            <TruncatedId id={data} link={href} />
        </div>
    );
}

interface IEmptyCell {
    type: SlotTableData.Empty;
}

function EmptyCell(): React.JSX.Element {
    return <div></div>;
}
