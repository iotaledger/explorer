export interface IHttpResponse {
  /**
   * Set a header on the response.
   * @param name The name of the header.
   * @param value The value of the header.
   */
  setHeader(name: string, value: number | string | string[]): void;

  /**
   * Set a status code on the response.
   * @param statusCode The status code to send.
   * @returns The response.
   */
  status(statusCode: number): IHttpResponse;

  /**
   * Send data in the response.
   * @param body The data to send.
   * @returns The response.
   */
  send(body: unknown): IHttpResponse;

  /**
   * End the response.
   */
  end(): void;
}
