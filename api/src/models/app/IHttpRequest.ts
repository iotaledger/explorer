import { IncomingHttpHeaders} from "http";

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
    body: any;

    /**
     * The query parameters.
     */
    query: { [key: string]: any };

    /**
     * Incoming Http Headers.
     */
    headers: IncomingHttpHeaders;
}
