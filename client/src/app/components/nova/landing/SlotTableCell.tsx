import { SlotStatus } from "~/app/lib/enums";
import { PillStatus } from "~/app/lib/ui/enums";
import React from "react";
import StatusPill from "../StatusPill";
import TruncatedId from "../../stardust/TruncatedId";
import classNames from "classnames";
import { useSlotManaBurned } from "~/helpers/nova/hooks/useSlotManaBurned";
import { useSlotStats } from "~/helpers/nova/hooks/useSlotStats";
import Spinner from "../../Spinner";
import { Link } from "react-router-dom";

export enum SlotTableCellType {
    StatusPill = "status-pill",
    Link = "link",
    Text = "text",
    TruncatedId = "truncated-id",
    Stats = "stats",
    BurnedMana = "burned-mana",
    Empty = "empty",
}

export type TSlotTableData = IPillStatusCell | ITextCell | ILinkCell | ITruncatedIdCell | IStatsCell | IBurnedManaCell | IEmptyCell;

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
        case SlotTableCellType.Stats:
            Component = <StatsCell {...cellData} />;
            break;
        case SlotTableCellType.BurnedMana:
            Component = <BurnedManaCell {...cellData} />;
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
    return <Link to={href}>{data}</Link>;
}

interface IStatsCell {
    data: string;
    type: SlotTableCellType.Stats;
    href: string;
    statsType: "blocks" | "transactions";
    shouldLoad?: boolean;
}

function StatsCell({ data, href, shouldLoad, statsType }: IStatsCell): React.JSX.Element {
    const [slotStats, isLoading] = useSlotStats(shouldLoad ? data : null);
    if (!shouldLoad) {
        return <Spinner compact />;
    }
    const stat = statsType === "blocks" ? slotStats?.blockCount : slotStats?.perPayloadType?.transaction;
    return <span>{isLoading ? <Spinner compact /> : stat ? <Link to={href}>{stat}</Link> : "0"}</span>;
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

interface IBurnedManaCell {
    type: SlotTableCellType.BurnedMana;
    data: string;
    shouldLoad: boolean;
}

function BurnedManaCell({ data, shouldLoad }: IBurnedManaCell): React.JSX.Element {
    const { slotManaBurned, isLoading } = useSlotManaBurned(shouldLoad ? data : null);
    if (!shouldLoad) {
        return <Spinner compact />;
    }
    return <span>{isLoading ? <Spinner compact /> : slotManaBurned?.manaBurned ?? "--"}</span>;
}

interface IEmptyCell {
    type: SlotTableCellType.Empty;
}

function EmptyCell(_: IEmptyCell): React.JSX.Element {
    return <div></div>;
}
