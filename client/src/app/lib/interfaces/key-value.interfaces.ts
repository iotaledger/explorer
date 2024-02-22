export interface IKeyValue {
    orientation?: "row" | "column";
    label: string;
    value: string | number | null | undefined;
}

export interface IKeyValueEntries extends IKeyValue {
    isPreExpanded?: boolean;
    entries?: IKeyValue[];
}
