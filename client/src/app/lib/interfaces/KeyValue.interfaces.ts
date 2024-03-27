import { ReactNode } from "react";

export interface IKeyValue {
    orientation?: "row" | "column";
    label: string;
    value: string | number | null | ReactNode | undefined;
}

export interface IKeyValueEntries extends IKeyValue {
    isPreExpanded?: boolean;
    entries?: IKeyValue[];
}
