export interface IdentityJsonDifferenceProps {
    messageId: string;
    content: unknown;

    compareWith?: {
        messageId: string;
        content: unknown;
    }[];
}
