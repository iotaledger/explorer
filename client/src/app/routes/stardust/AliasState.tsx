/* eslint-disable no-shadow */
import { IAliasOutput } from "@iota/iota.js-stardust";
import { IBech32AddressDetails } from "../../../models/IBech32AddressDetails";
import IFoundryDetails from "./IFoundryDetails";

export interface AliasState {
    /**
     * The addres in bech 32 format.
     */
    bech32AddressDetails?: IBech32AddressDetails;

    /**
     * Are the component native tokens loading.
     */
    areFoundriesLoading: boolean;

    /**
     * List of foundries of the alias.
     */
    foundries?: IFoundryDetails[];

    /**
     * Current page number in native tokens table.
     */
    foundriesPageNumber: number;

    /**
     * Current page in tokens table.
     */
    foundriesPage: IFoundryDetails[];

    /**
     * alias output.
     */
    output?: IAliasOutput;

    /**
     * Hex view of data.
     */
    hexData?: string;

    /**
     * UTF8 view of data.
     */
    utf8Data?: string;

    /**
     * JSON view of data.
     */
    jsonData?: string;

}

