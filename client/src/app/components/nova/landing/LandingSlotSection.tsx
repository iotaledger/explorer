import React from "react";
import useSlotsFeed from "~/helpers/nova/hooks/useSlotsFeed";
import Table, { ITableRow } from "../../Table";
import SlotTableCell, { TSlotTableCell } from "./SlotTableCell";
import { getTableRows } from "~/app/lib/utils/slot-table.utils";
import "./LandingSlotSection.scss";

const LandingSlotSection = ({ network }: { network: string }): React.JSX.Element | null => {
    const { currentSlotIndex, currentSlotProgressPercent, latestSlotIndexes, latestSlotCommitments } = useSlotsFeed();

    if (currentSlotIndex === null || currentSlotProgressPercent === null) {
        return null;
    }

    const TABLE_HEADINGS = ["Index", "ID", "RMC", "Blocks", "Txs", "Burned mana", "Status", "From/To"];
    const tableData: ITableRow<TSlotTableCell>[] = getTableRows(currentSlotIndex, latestSlotIndexes, latestSlotCommitments, network);

    return (
        <div className="slots-section">
            <h2 className="slots-section__header">Latest Slots</h2>
            <div className="slots-section__table">
                <Table headings={TABLE_HEADINGS} data={tableData} CellComponent={SlotTableCell} />
            </div>
        </div>
    );
};

export default LandingSlotSection;
