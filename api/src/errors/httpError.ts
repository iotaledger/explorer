/**
 * Class to handle http errors.
 */
export class HttpError extends Error {
    /**
     * Bad Request error code.
     */
    public static BAD_REQUEST: number = 400;

    /**
     * Unauthorized error code.
     */
    public static UNAUTHORIZED: number = 401;

    /**
     * Forbidden error code.
     */
    public static FORBIDDEN: number = 403;

    /**
     * Not found error code.
     */
    public static NOT_FOUND: number = 404;

    /**
     * Service unavailable error code.
     */
    public static SERVICE_UNAVAILABLE: number = 503;

    /**
     * The HTTP code to return.
     */
    public httpCode: number;

    /**
     * Create a new instance of HttpError.
     * @param message The message for the error.
     * @param httpCode The http status code.
     */
    constructor(message: string, httpCode: number) {
        super(message);
        this.httpCode = httpCode;
    }
}
