import { IResponse } from "./IResponse";

export interface IMarketResponse extends IResponse {
    /**
     * Market data by date.
     */
    data?: {
        [date: string]: {
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
        };
    };
}
