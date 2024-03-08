/* eslint-disable import/no-unresolved */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { CommitteeResponse } from "@iota/sdk-nova";
import { IResponse } from "./IResponse";

export interface IEpochCommitteeResponse extends IResponse {
    committeeResponse?: CommitteeResponse;
}
