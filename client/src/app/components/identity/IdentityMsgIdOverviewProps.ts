import { IdentityMsgStatus } from "~models/identityMsgStatus";
export interface IdentityMsgIdOverviewProps {
    messageId?: string;
    status: IdentityMsgStatus;
    onClick(): void;
}
