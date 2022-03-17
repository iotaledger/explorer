export interface IIdentityDocument {
    doc: Record<string, unknown>;
    meta: {
        created?: string;
        updated?: string;
        previousMessageId?: string;
    };
    proof?: string;
}
