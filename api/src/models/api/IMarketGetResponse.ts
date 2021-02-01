import { IResponse } from "./IResponse";
import { ISignedResponse } from "./ISignedResponse";

export interface IMarketGetResponse extends IResponse, ISignedResponse {
    /**
     * Market data by date.
     */
    data?: {
        /**
         * The market date.
         */
        d: string;
        /**
         * The market price.
         */
        p: number;
        /**
         * The market cap.
         */
        m: number;
        /**
         * 24h Market volume.
         */
        v: number;
    }[];

    /**
     * Market data every 5 minutes for the last day.
     */
    day?: {
        /**
         * The timestamp.
         */
        t: number;
        /**
         * The market price.
         */
        p: number;
        /**
         * The market cap.
         */
        m: number;
        /**
         * Market volume.
         */
        v: number;
    }[];
}
