import { IConfiguration } from "../configuration/IConfiguration";

export interface IRoute {
    /**
     * The path to use for routing.
     */
    path: string;
    /**
     * The http method.
     */
    method: "get" | "post" | "put" | "delete";
    /**
     * Folder within the routes folder.
     */
    folder?: string;
    /**
     * The name of the function to load.
     */
    func?: string;
    /**
     * The body is separate data so don't merge with params.
     */
    dataBody?: boolean;
    /**
     * The response is data so look for contentType, filename and data.
     */
    dataResponse?: boolean;
    /**
     * Perform inline function instead of module load.
     * @param config The confiuration.
     * @param params The request parameters.
     * @param body The request body.
     * @param header The headers in the http request.
     */
    inline?(
        config: IConfiguration,
        params: unknown,
        body?: unknown,
        headers?: { [id: string]: unknown }): Promise<unknown>;
}
