export interface IIdentityMessageWrapper {
    messageId: string;
    message: unknown;
    document: {
        created?: string;
        updated?: string;
    };
    isDiff: boolean;
    parentMessageId?: string;
}
