export interface IDataResponse {
    /**
     * Success
     */
    success: boolean;
    /**
     * The content type of the data response.
     */
    contentType?: string;
    /**
     * Show the content inline.
     */
    inline?: boolean;
    /**
     * The buffer of data to return.
     */
    data: Buffer;
    /**
     * The filename for an attachment.
     */
    filename?: string;
}
