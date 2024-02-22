import classNames from "classnames";
import React, { useState } from "react";
import { IKeyValue, IKeyValueEntries } from "~/app/lib/interfaces";
import DropdownIcon from "~assets/dropdown-arrow.svg?react";

function KeyValuePair({ label, value, orientation }: IKeyValue): React.JSX.Element {
    return (
        <>
            {value !== undefined && value !== null && (
                <>
                    <div className="card--label">{label}</div>
                    <div
                        className={classNames(
                            "card--value",
                            "row",
                            { "margin-b-0": orientation === "row" },
                            { "padding-l-8": orientation === "row" },
                        )}
                    >
                        {value}
                    </div>
                </>
            )}
        </>
    );
}

export default function KeyValueEntries({ isPreExpanded, label, value, entries }: IKeyValueEntries): React.JSX.Element {
    const [isExpanded, setIsExpanded] = useState<boolean>(isPreExpanded ?? false);

    return (
        <div>
            <div className="card--content__input card--value row middle" onClick={() => setIsExpanded(!isExpanded)}>
                <div className={classNames("margin-r-t", "card--content--dropdown", { opened: isExpanded })}>
                    <DropdownIcon />
                </div>
                <KeyValuePair label={label} value={value} orientation="row" />
            </div>

            {entries && entries.length > 0 && isExpanded && (
                <div className="padding-l-t left-border">
                    {entries.map((entry, idx) => (
                        <KeyValuePair key={idx} {...entry} />
                    ))}
                </div>
            )}
        </div>
    );
}
