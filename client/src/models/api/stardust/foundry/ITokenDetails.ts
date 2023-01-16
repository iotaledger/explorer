import { ITokenSchemaIRC30 } from "./ITokenSchemaIRC30";

export interface ITokenDetails extends Partial<ITokenSchemaIRC30> {
    /** Token id. */
    id: string;
     /** Token held amount. */
    amount: number;
    /** Token price. */
    price?: number;
    /** Token total value held. */
    value?: number;
}
