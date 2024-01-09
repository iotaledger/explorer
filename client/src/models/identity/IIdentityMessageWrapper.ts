export interface IIdentityMessageWrapper {
  messageId: string;
  message: unknown;
  document: {
    doc: Record<string, unknown>;
    meta: {
      created?: string;
      updated?: string;
    };
  };
  isDiff: boolean;
  parentMessageId?: string;
}
