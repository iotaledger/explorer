import { IIdentityDocument } from "./../models/identity/IIdentityDocument";
export class IdentityHelper {
    /**
     * @param msgId messageId to shorten
     * @returns returns a shorter string containing the first and last seven characters of the messageId.
     */
    public static shortenMsgId(msgId: string): string {
        if (msgId.length < 10) {
            return msgId;
        }

        return `${msgId.slice(0, 7)}....${msgId.slice(-7)}`;
    }

        /**
         * transforms a identity document based on messageType and version
         * @param document document to transform
         * @param messageType type of message
         * @param version version of the identity document
         * @returns transformed document
         */
        public static transformDocument(
        document: unknown, messageType: "diff" | "integration", version: string): Record<string, unknown> {
            let transformedDocument = document as Record<string, unknown>;
            if (messageType === "integration" && version === "legacy") {
                transformedDocument = {
                    ...(document as IIdentityDocument).doc,
                    ...(document as IIdentityDocument).meta,
                    proof: (document as IIdentityDocument).proof
                };
            }

            if (messageType === "integration") {
                delete transformedDocument.integrationMessageId;
            }

            return transformedDocument;
    }
}
