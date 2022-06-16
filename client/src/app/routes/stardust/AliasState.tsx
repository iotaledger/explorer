/* eslint-disable no-shadow */
import { IAliasOutput } from "@iota/iota.js-stardust";
import { IBech32AddressDetails } from "../../../models/IBech32AddressDetails";

export interface AliasState {
    /**
     * The addres in bech 32 format.
     */
    bech32AddressDetails?: IBech32AddressDetails;

    /**
     * Are the controlled Foundries loading.
     */
    areFoundriesLoading: boolean;

    /**
     * List of foundries controlled by the alias.
     */
    foundries?: { foundryId: string }[];

    /**
     * Current page number of controlled Foundries.
     */
    foundriesPageNumber: number;

    /**
     * Current page of controlled Foundries.
     */
    foundriesPage: { foundryId: string }[];

    /**
     * The Alias output.
     */
    output?: IAliasOutput;

    /**
     * Hex form of state metadata.
     */
    stateMetadataHex?: string;

    /**
     * UTF8 form of state metadata.
     */
    stateMetadataUtf8?: string;

    /**
     * JSON form of state metadata.
     */
    stateMetadataJson?: string;

}

