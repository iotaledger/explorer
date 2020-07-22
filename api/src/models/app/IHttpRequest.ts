import { IncomingHttpHeaders } from "http";

export interface IHttpRequest {
    /**
     * The request method.
     */
    method?: string;

    /**
     * The request url.
     */
    url?: string;

    /**
     * The request body.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    body: any;

    /**
     * The query parameters.
     */
    query: { [key: string]: unknown };

    /**
     * Incoming Http Headers.
     */
    headers: IncomingHttpHeaders;
}
