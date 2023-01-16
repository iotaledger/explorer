import { ITokenDetails } from "../../../models/api/stardust/foundry/ITokenDetails";

export interface AssetProps {
    /**
     * Token
     */
    token: ITokenDetails;
    /**
     * Network
     */
    network: string;
    /**
     * True if the asset is rendered like a table
     */
    tableFormat?: boolean;
    /**
     * True if token data is still loading
     */
    isLoading?: boolean;
}
