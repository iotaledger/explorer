export interface IKeyValue {
    label: string;
    value: string | number | null | undefined;
}

export interface IKeyValueEntries extends IKeyValue {
    entries?: IKeyValue[];
}
