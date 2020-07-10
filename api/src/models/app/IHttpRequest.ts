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
    // tslint:disable-next-line: no-any
    body: any;

    /**
     * The query parameters.
     */
    // tslint:disable-next-line: no-any
    query: { [key: string]: any };

    /**
     * Incoming Http Headers.
     */
    headers: IncomingHttpHeaders;
}
