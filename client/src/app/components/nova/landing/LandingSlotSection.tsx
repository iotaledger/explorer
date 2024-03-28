import React from "react";
import Table, { ITableRow } from "../../Table";
import SlotTableCell, { TTableData } from "../TableCell";
import { useGenerateSlotsTable } from "~/helpers/nova/hooks/useGenerateSlotsTable";
import { SlotTableHeadings } from "~/app/lib/ui/enums";
import "./LandingSlotSection.scss";

const LandingSlotSection = (): React.JSX.Element | null => {
    const tableData: ITableRow<TTableData>[] = useGenerateSlotsTable();
    const tableHeadings = Object.values(SlotTableHeadings);

    return (
        <div className="slots-section">
            <h2 className="slots-section__header">Latest Slots</h2>
            <div className="slots-section__table">
                <Table headings={tableHeadings} data={tableData} TableDataComponent={SlotTableCell} />
            </div>
        </div>
    );
};

export default LandingSlotSection;
