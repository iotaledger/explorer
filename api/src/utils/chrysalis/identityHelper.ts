import { ILatestDocument } from "../../models/api/chrysalis/identity/IIdentityLatestDocument";

export class IdentityHelper {
    /**
     * Converts a legacy to a latest document
     * @param legacyDocument document in legacy structure
     * @returns document in latest structure
     */
    public static convertLegacyDocument(
        legacyDocument: Record<string, unknown>): ILatestDocument {
            const transformedDocument = {
                doc: legacyDocument,
                meta: {
                    updated: legacyDocument.updated,
                    created: legacyDocument.created
                },
                proof: legacyDocument.proof
            };
            delete transformedDocument.doc.updated;
            delete transformedDocument.doc.created;
            delete transformedDocument.doc.proof;

            return transformedDocument;
    }

    /**
     * Reverts a latest document to a legacy document
     * @param latestDocument document in latest structure
     * @returns document in legacy structure
     */
     public static revertLegacyDocument(
        latestDocument: ILatestDocument): Record<string, unknown> {
            const transformedDocument: Record<string, unknown> = {
                ...latestDocument.doc,
                ...latestDocument.meta
            };

            return transformedDocument;
    }
}
