import logger from "../../logger";
import { IMilestoneGetRequest } from "../../models/api/legacy/IMilestoneGetRequest";
import { IMilestoneGetResponse } from "../../models/api/legacy/IMilestoneGetResponse";
import { IFindTransactionsRequest } from "../../models/clients/legacy/IFindTransactionsRequest";
import { IFindTransactionsResponse } from "../../models/clients/legacy/IFindTransactionsResponse";
import { IGetBalanceRequest } from "../../models/clients/legacy/IGetBalanceRequest";
import { IGetBalanceResponse } from "../../models/clients/legacy/IGetBalanceResponse";
import { IGetTransactionMetadataRequest } from "../../models/clients/legacy/IGetTransactionMetadataRequest";
import { IGetTrytesRequest } from "../../models/clients/legacy/IGetTrytesRequest";
import { IGetTrytesResponse } from "../../models/clients/legacy/IGetTrytesResponse";
import { ITransactionMetadataResponse } from "../../models/clients/legacy/ITransactionMetadataResponse";
import { FetchHelper } from "../../utils/fetchHelper";

/**
 * Class to handle api communications with legacy.
 */
export class LegacyClient {
  /**
   * The endpoint for performing communications.
   */
  private readonly _endpoint: string;

  /**
   * The user for performing communications.
   */
  private readonly _user?: string;

  /**
   * The password for performing communications.
   */
  private readonly _password?: string;

  /**
   * Create a new instance of LegacyClient.
   * @param endpoint The endpoint for the api.
   * @param user The user for the api.
   * @param password The password for the api.
   */
  constructor(endpoint: string, user?: string, password?: string) {
    this._endpoint = endpoint;
    this._user = user;
    this._password = password;
  }

  /**
   * Find the transaction for the given request object.
   * @param request The hashes to find the transaction hashes for.
   * @returns The list of found transaction hashes.
   */
  public async findTransactions(request: IFindTransactionsRequest): Promise<IFindTransactionsResponse | undefined> {
    try {
      const headers: { [id: string]: string } = {};
      if (this._user && this._password) {
        const userPass = Buffer.from(`${this._user}:${this._password}`).toString("base64");
        headers.Authorization = `Basic ${userPass}`;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const searchParams: { [id: string]: any } = {};

      if (request.address) {
        searchParams.address = request.address.slice(0, 81);
      }

      if (request.tag) {
        searchParams.tag = String(request.tag).padEnd(27, "9");
      }

      if (request.bundle) {
        searchParams.bundle = request.bundle.slice(0, 81);
      }

      if (request.approvee) {
        searchParams.approvee = request.approvee.slice(0, 81);
      }

      const params = FetchHelper.urlParams(searchParams);

      const response = await FetchHelper.json<IFindTransactionsRequest, IFindTransactionsResponse>(
        this._endpoint,
        `core/v0/transactions${params}`,
        "get",
        null,
        headers,
      );

      if (response.error) {
        logger.error(`[LegacyClient] findTransactions failed: ${response.error}\n
                             ${FetchHelper.convertToCurl(this._endpoint, `core/v0/transactions${params}`, "post", headers, null)}
                             `);
      }

      return response;
    } catch (err) {
      logger.error(`[LegacyClient] findTransactions error: ${err.response?.data?.error ?? err}`);
    }
  }

  /**
   * Get the transaction objects for the requested hashes.
   * @param request The hashes to get the transaction objects for.
   * @returns The list of corresponding transaction objects.
   */
  public async getTrytes(request: IGetTrytesRequest): Promise<IGetTrytesResponse | undefined> {
    try {
      const headers: { [id: string]: string } = {};
      if (this._user && this._password) {
        const userPass = Buffer.from(`${this._user}:${this._password}`).toString("base64");
        headers.Authorization = `Basic ${userPass}`;
      }

      const response = await FetchHelper.json<IGetTrytesRequest, IGetTrytesResponse>(
        this._endpoint,
        `core/v0/transactions/${request.txHash}/trytes`,
        "get",
        null,
        headers,
      );

      if (response.error) {
        logger.error(`[LegacyClient] getTrytes failed: ${response.error}\n
                             ${FetchHelper.convertToCurl(
                               this._endpoint,
                               `core/v0/transactions/${request.txHash}/trytes`,
                               "get",
                               headers,
                               null,
                             )}
                             `);
      }

      return response;
    } catch (err) {
      logger.error(`[LegacyClient] getTrytes error: ${err.response?.data?.error ?? err}`);
    }
  }

  /**
   * Get the transaction metadata for the requested hash.
   * @param request The hash to get the transaction metadata for.
   * @returns The metadata of the corresponding transaction.
   */
  public async getTransactionMetadata(request: IGetTransactionMetadataRequest): Promise<ITransactionMetadataResponse | undefined> {
    try {
      const headers: { [id: string]: string } = {};
      if (this._user && this._password) {
        const userPass = Buffer.from(`${this._user}:${this._password}`).toString("base64");
        headers.Authorization = `Basic ${userPass}`;
      }

      const response = await FetchHelper.json<IGetTransactionMetadataRequest, ITransactionMetadataResponse>(
        this._endpoint,
        `core/v0/transactions/${request.txHash}/metadata`,
        "get",
        null,
        headers,
      );

      if (response.error) {
        logger.error(`[LegacyClient] getTransactionMetadata failed: ${response.error}\n
                             ${FetchHelper.convertToCurl(
                               this._endpoint,
                               `core/v0/transactions/${request.txHash}/metadata`,
                               "get",
                               headers,
                               null,
                             )}
                             `);
      }

      return response;
    } catch (err) {
      logger.error(`[LegacyClient] getTransactionMetadata error: ${err.response?.data?.error ?? err}`);
    }
  }

  /**
   * Get the balance for the requested address.
   * @param request The hash to get the transaction metadata for.
   * @returns The metadata of the corresponding transaction.
   */
  public async getBalance(request: IGetBalanceRequest): Promise<IGetBalanceResponse | undefined> {
    try {
      const headers: { [id: string]: string } = {};
      if (this._user && this._password) {
        const userPass = Buffer.from(`${this._user}:${this._password}`).toString("base64");
        headers.Authorization = `Basic ${userPass}`;
      }

      const response = await FetchHelper.json<IGetBalanceRequest, IGetBalanceResponse>(
        this._endpoint,
        `core/v0/addresses/${request.address}/balance`,
        "get",
        null,
        headers,
      );

      if (response.error) {
        logger.error(`[LegacyClient] getBalance failed: ${response.error}\n
                             ${FetchHelper.convertToCurl(
                               this._endpoint,
                               `core/v0/addresses/${request.address}/balance`,
                               "get",
                               headers,
                               null,
                             )}
                             `);
      }

      return response;
    } catch (err) {
      logger.error(`[LegacyClient] getBalance error: ${err.response?.data?.error ?? err}`);
    }
  }

  /**
   * Get the milestone for the requested index.
   * @param request The index to get the requested data for.
   * @returns The metadata of the milestone.
   */
  public async milestoneByIndex(request: IMilestoneGetRequest): Promise<IMilestoneGetResponse | undefined> {
    try {
      const headers: { [id: string]: string } = {};
      if (this._user && this._password) {
        const userPass = Buffer.from(`${this._user}:${this._password}`).toString("base64");
        headers.Authorization = `Basic ${userPass}`;
      }

      const response = await FetchHelper.json<IMilestoneGetRequest, IMilestoneGetResponse>(
        this._endpoint,
        `core/v0/milestones/by-index/${request.milestoneIndex}`,
        "get",
        null,
        headers,
      );

      if (response.error) {
        logger.error(`[LegacyClient] milestoneByIndex failed: ${response.error}\n
                             ${FetchHelper.convertToCurl(
                               this._endpoint,
                               `core/v0/milestones/by-index/${request.milestoneIndex}`,
                               "get",
                               headers,
                               null,
                             )}
                             `);
      }

      return response;
    } catch (err) {
      logger.error(`[LegacyClient] milestoneByIndex error: ${err.response?.data?.error ?? err}`);
    }
  }
}
