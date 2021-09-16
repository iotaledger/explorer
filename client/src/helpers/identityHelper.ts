
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
}
