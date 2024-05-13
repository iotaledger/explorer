import { CommitteeResponse } from "@iota/sdk-wasm-nova/web";
import { IResponse } from "../IResponse";

export interface IEpochCommitteeResponse extends IResponse {
    committeeResponse: CommitteeResponse;
}
