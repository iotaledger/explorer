import { IDIDResolverResponse } from "~/models/api/IDIDResolverResponse";

export interface DIDResolverProps {
    resolvedDID: IDIDResolverResponse | null;

    network: string;
}
