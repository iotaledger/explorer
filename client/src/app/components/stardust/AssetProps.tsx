export interface AssetProps {
    /**
     * The name of an asset.
     */
    name: string;
    /**
     * The symbol of an asset
     */
    symbol?: string;
    /**
     * Total quantity related to an asset
     */
    amount: number;
    /**
     * Price of an asset
     */
    price?: number;
    /**
     * Value of an asset
     */
    value?: number;
    /**
     * Network
     */
    network: string;
    /**
     * True if the asset is rendered like a table
     */
    tableFormat?: boolean;
}
