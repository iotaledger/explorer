export interface IIdentityMessageWrapper {
    messageId: string;
    content: {
        message: unknown;
        document: {
            created?: string;
            updated?: string;
        };
    };
    messageType?: "diff" | "int";
}
