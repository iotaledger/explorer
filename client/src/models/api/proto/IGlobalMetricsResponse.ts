import { IGlobalMetrics } from "@iota/protonet.js";
import { IResponse } from "../IResponse";

export interface IGlobalMetricsResponse extends IResponse {
    metrics?: IGlobalMetrics;
}

