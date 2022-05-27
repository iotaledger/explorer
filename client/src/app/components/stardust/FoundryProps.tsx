export interface FoundryProps {
    /**
     * Foundry Id.
     */
    foundryId: string;

    /**
     * Created date of foundry
     */
    dateCreated?: Date;

    /**
     * Network
     */
    network: string;

    /**
     * True if the asset is rendered like a table
     */
    tableFormat?: boolean;
}
