/* eslint-disable camelcase */
export interface ICMCQuotesLatestResponse {
    data?: {
        [id: string]: {
            quote?: {
                [currency: string]: {
                    price: number;
                    volume_24h: number;
                    percent_change_1h: number;
                    percent_change_24h: number;
                };
            };
        };
    };
}
