import { IIdentityStardustResolveRequest } from "../../../models/api/IIdentityStardustResolveRequest";
import { IIdentityStardustResolveResponse } from "../../../models/api/IIdentityStardustResolveResponse";
import { IConfiguration } from "../../../models/configuration/IConfiguration";

import { IAliasOutput } from "@iota/iota.js-stardust";

export async function get(
    config: IConfiguration,
    request: IIdentityStardustResolveRequest
): Promise<IIdentityStardustResolveResponse> {
    return {
        response: "success"
    }
}