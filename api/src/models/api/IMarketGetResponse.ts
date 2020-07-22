import { IResponse } from "./IResponse";

export interface IMarketGetResponse extends IResponse {
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
}
