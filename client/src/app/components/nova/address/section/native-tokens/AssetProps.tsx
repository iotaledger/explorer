import { IToken } from "~models/api/stardust/foundry/IToken";

export interface AssetProps {
    /**
     * Token
     */
    token: IToken;

    /**
     * True if the asset is rendered like a table
     */
    tableFormat?: boolean;
}
