export interface ControlledFoundryProps {
    /**
     * The foundry id.
     */
    foundryId: string;

    /**
     * The network id in context.
     */
    network: string;

    /**
     * True if the asset is rendered like a table
     */
    tableFormat?: boolean;
}
