import { IResponse } from "../IResponse";

export interface ITransactionActionResponse extends IResponse {
    /**
     * The result of the action.
     */
    result?: string;
}
