import classNames from "classnames";
import React, { useState } from "react";
import { IKeyValue, IKeyValueEntries } from "~/app/lib/interfaces";
import DropdownIcon from "~assets/dropdown-arrow.svg?react";

function KeyValuePair({ label, value }: IKeyValue): React.JSX.Element {
    return (
        <>
            {value !== undefined && value !== null && (
                <div className="key-value">
                    <div className="entry--key">{label}</div>
                    <div className="entry--value">{value}</div>
                </div>
            )}
        </>
    );
}

export default function KeyValueEntries({ label, value, entries }: IKeyValueEntries): React.JSX.Element {
    const [isExpanded, setIsExpanded] = useState<boolean>(false);

    return (
        <div className="key-value-wrapper">
            <div className="key-value--row" onClick={() => setIsExpanded(!isExpanded)}>
                <div className={classNames("margin-r-t", "card--content--dropdown", { opened: isExpanded })}>
                    <DropdownIcon />
                </div>
                <KeyValuePair label={label} value={value} />
            </div>

            {entries && entries.length > 0 && isExpanded && (
                <div className="key-value-entries padding-l-t left-border">
                    {entries.map((entry, idx) => (
                        <KeyValuePair key={idx} {...entry} />
                    ))}
                </div>
            )}
        </div>
    );
}
