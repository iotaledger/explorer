import { IOutputResponse } from "@iota/iota.js";


export interface TransactionProps {
    output: IOutputResponse;
    network: string;
}
