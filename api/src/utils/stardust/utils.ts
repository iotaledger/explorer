import { Block, Client, CommonOutput, IOutputsResponse, MilestonePayload, Utils } from "@iota/sdk-stardust";
import bigInt, { BigInteger } from "big-integer";

/**
 * Compute a blockId from a milestone payload.
 * @param protocolVersion The protocol version to use.
 * @param payload The milestone payload.
 * @returns The blockId of the block with the milestone payload.
 */
export function blockIdFromMilestonePayload(protocolVersion: number, payload: MilestonePayload): string {
    const block = new Block();
    block.protocolVersion = protocolVersion;
    block.parents = payload.parents;
    block.payload = payload;
    block.nonce = "0";

    return Utils.blockId(block);
}

/**
 * Get the balance for an address.
 * @param client The client or node endpoint to get the information from.
 * @param address The address to get the balances for (Bech 32).
 * @returns The balance.
 */
export async function addressBalance(
    client: Client,
    address: string,
): Promise<{
    balance: BigInteger;
    nativeTokens: { [id: string]: BigInteger };
    ledgerIndex: number;
}> {
    let total: BigInteger = bigInt(0);
    let ledgerIndex = 0;
    const nativeTokens: { [id: string]: BigInteger } = {};

    let response: IOutputsResponse;
    let expirationResponse: IOutputsResponse;
    let cursor: string | undefined;
    let expirationCursor: string | undefined;
    do {
        response = await client.basicOutputIds([{ address }, { cursor }]);

        for (const outputId of response.items) {
            const outputResponse = await client.getOutput(outputId);

            if (!outputResponse.metadata.isSpent) {
                total = total.plus(outputResponse.output.getAmount());

                const nativeTokenOutput = outputResponse.output as CommonOutput;
                if (Array.isArray(nativeTokenOutput.getNativeTokens())) {
                    for (const token of nativeTokenOutput.getNativeTokens()) {
                        nativeTokens[token.id] = nativeTokens[token.id] ?? bigInt(0);
                        nativeTokens[token.id] = nativeTokens[token.id].add(token.amount);
                    }
                }
            }
            ledgerIndex = outputResponse.metadata.ledgerIndex;
        }
        cursor = response.cursor;
    } while (cursor && response.items.length > 0);

    do {
        expirationResponse = await client.basicOutputIds([
            { expirationReturnAddress: address },
            { expiresBefore: Math.floor(Date.now() / 1000) },
            { cursor: expirationCursor },
        ]);

        for (const outputId of expirationResponse.items) {
            const output = await client.getOutput(outputId);

            if (!output.metadata.isSpent) {
                total = total.plus(output.output.getAmount());
            }
        }
        expirationCursor = expirationResponse.cursor;
    } while (expirationCursor && expirationResponse.items.length > 0);

    return {
        balance: total,
        nativeTokens,
        ledgerIndex,
    };
}
