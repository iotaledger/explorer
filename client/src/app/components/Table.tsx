import React from "react";
import "./Table.scss";

export interface ITableRow<K> {
    /**
     * The id of the row, necessary for React to keep track of the row
     */
    id: string;
    /**
     * The data for the row
     */
    data: K[];
}

interface ITable<T, K extends ITableRow<T>[]> {
    /**
     * The headings for the table
     */
    headings: string[];
    /**
     * The data for the table
     */
    data: K;
    /**
     * The function to render the table data
     */
    TableDataComponent: (props: T) => React.JSX.Element;
}

export default function Table<T, K extends ITableRow<T>[]>({ headings, data, TableDataComponent }: ITable<T, K>): React.JSX.Element {
    return (
        <div className="table-container">
            <table>
                <thead>
                    <tr>
                        {headings.map((heading) => {
                            return <th key={heading}>{heading}</th>;
                        })}
                    </tr>
                </thead>
                <tbody>
                    {data.map((row) => (
                        <tr key={row.id}>
                            {row.data.map((td, columnIndex) => (
                                <td key={`${row.id} ${columnIndex}`}>{TableDataComponent(td)}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
