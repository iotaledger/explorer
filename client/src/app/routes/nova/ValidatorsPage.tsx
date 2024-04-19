import React from "react";
import { useValidators } from "~/helpers/nova/hooks/useValidators";
import "./ValidatorsPage.scss";
import { ValidatorsTableHeadings } from "~/app/lib/ui/enums/ValidatorsTableHeadings.enum";
import Table, { ITableRow } from "~/app/components/Table";
import TableCellWrapper, { TTableData } from "~/app/components/nova/TableCell";
import { useGenerateValidatorsTable } from "~/helpers/nova/hooks/useGenerateValidatorsTable";

const ValidatorsPage: React.FC = () => {
    const { validators, error } = useValidators();
    const tableData: ITableRow<TTableData>[] = useGenerateValidatorsTable(validators ?? []);
    const tableHeadings = Object.values(ValidatorsTableHeadings);

    return (
        <section className="validators-page">
            <div className="wrapper">
                <div className="inner">
                    <div className="validators-page__header">
                        <div className="header__title row middle">
                            <h1>Validators</h1>
                        </div>
                    </div>
                    <div className="section__validators">
                        <Table headings={tableHeadings} data={tableData} TableDataComponent={TableCellWrapper} />
                    </div>
                    {error && <p className="danger">Failed to retrieve validators. {error}</p>}
                </div>
            </div>
        </section>
    );
};

export default ValidatorsPage;
