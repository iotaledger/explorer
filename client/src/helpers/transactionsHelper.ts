import { Converter, Ed25519Address, ED25519_ADDRESS_TYPE, IMessage, IReferenceUnlockBlock, ISignatureUnlockBlock, IUTXOInput, REFERENCE_UNLOCK_BLOCK_TYPE, SIGNATURE_UNLOCK_BLOCK_TYPE, SIG_LOCKED_DUST_ALLOWANCE_OUTPUT_TYPE, SIG_LOCKED_SINGLE_OUTPUT_TYPE, TRANSACTION_PAYLOAD_TYPE, WriteStream } from "@iota/iota.js";
import { DateHelper } from "../helpers/dateHelper";
import { IBech32AddressDetails } from "../models/IBech32AddressDetails";
import { MessageTangleStatus } from "../models/messageTangleStatus";
import { TangleCacheService } from "../services/tangleCacheService";
import { Bech32AddressHelper } from "./bech32AddressHelper";

export class TransactionsHelper {
    public static async getInputsAndOutputs(
        transactionMessage: IMessage | undefined,
        network: string, _bechHrp: string, tangleCacheService: TangleCacheService): Promise<any> {
        const inputs: (IUTXOInput & {
            outputHash: string;
            isGenesis: boolean;
            transactionUrl: string;
            transactionAddress: IBech32AddressDetails;
            signature: string;
            publicKey: string;
            amount: number;
        })[] = [];
        const outputs = [];
        let transferTotal = 0;
        const unlockAddresses: IBech32AddressDetails[] = [];

        if (transactionMessage?.payload?.type === TRANSACTION_PAYLOAD_TYPE) {
            const GENESIS_HASH = "0".repeat(64);

            const signatureBlocks: ISignatureUnlockBlock[] = [];
            for (let i = 0; i < transactionMessage.payload.unlockBlocks.length; i++) {
                if (transactionMessage.payload.unlockBlocks[i].type === SIGNATURE_UNLOCK_BLOCK_TYPE) {
                    const sigUnlockBlock = transactionMessage.payload.unlockBlocks[i] as ISignatureUnlockBlock;
                    signatureBlocks.push(sigUnlockBlock);
                } else if (transactionMessage.payload.unlockBlocks[i].type === REFERENCE_UNLOCK_BLOCK_TYPE) {
                    const refUnlockBlock = transactionMessage.payload.unlockBlocks[i] as IReferenceUnlockBlock;
                    signatureBlocks.push(
                        transactionMessage.payload.unlockBlocks[refUnlockBlock.reference] as ISignatureUnlockBlock
                    );
                }
            }

            for (let i = 0; i < signatureBlocks.length; i++) {
                unlockAddresses.push(
                    Bech32AddressHelper.buildAddress(
                        _bechHrp,
                        Converter.bytesToHex(
                            new Ed25519Address(Converter.hexToBytes(signatureBlocks[i].signature.publicKey))
                                .toAddress()
                        ),
                        signatureBlocks[i].type === SIGNATURE_UNLOCK_BLOCK_TYPE
                            ? ED25519_ADDRESS_TYPE : undefined
                    )
                );
            }

            for (let i = 0; i < transactionMessage.payload.essence.inputs.length; i++) {
                const input = transactionMessage.payload.essence.inputs[i];
                const isGenesis = input.transactionId === GENESIS_HASH;
                const writeOutputStream = new WriteStream();
                writeOutputStream.writeUInt16("transactionOutputIndex", input.transactionOutputIndex);
                const outputHash = input.transactionId + writeOutputStream.finalHex();
                const transactionOutputIndex = input.transactionOutputIndex;
                const transactionResult = await tangleCacheService.search(
                    network, input.transactionId);
                let amount = 0;
                if (transactionResult?.message && transactionResult?.message.payload?.type ===
                    TRANSACTION_PAYLOAD_TYPE) {
                    amount = transactionResult.message.payload?.essence.outputs[transactionOutputIndex].amount;
                }
                inputs.push({
                    ...input,
                    amount,
                    isGenesis,
                    outputHash,
                    transactionUrl: `/${network}/search/${outputHash}`,
                    transactionAddress: unlockAddresses[i],
                    signature: signatureBlocks[i].signature.signature,
                    publicKey: signatureBlocks[i].signature.publicKey
                });
            }

            let remainderIndex = 1000;
            for (let i = 0; i < transactionMessage.payload.essence.outputs.length; i++) {
                if (transactionMessage.payload.essence.outputs[i].type === SIG_LOCKED_SINGLE_OUTPUT_TYPE ||
                    transactionMessage.payload.essence.outputs[i].type === SIG_LOCKED_DUST_ALLOWANCE_OUTPUT_TYPE) {
                    const address = Bech32AddressHelper.buildAddress(
                        _bechHrp,
                        transactionMessage.payload.essence.outputs[i].address.address,
                        transactionMessage.payload.essence.outputs[i].address.type);
                    const isRemainder = inputs.some(input => input.transactionAddress.bech32 === address.bech32);
                    outputs.push({
                        index: isRemainder ? (remainderIndex++) + i : i,
                        type: transactionMessage.payload.essence.outputs[i].type,
                        address,
                        amount: transactionMessage.payload.essence.outputs[i].amount,
                        isRemainder
                    });
                    if (!isRemainder) {
                        transferTotal += transactionMessage.payload.essence.outputs[i].amount;
                    }
                }
            }

            for (let i = 0; i < inputs.length; i++) {
                const outputResponse = await tangleCacheService.outputDetails(
                    network, inputs[i].outputHash
                );

                if (outputResponse?.output) {
                    inputs[i].transactionAddress = Bech32AddressHelper.buildAddress(
                        _bechHrp,
                        outputResponse.output.address.address,
                        outputResponse.output.address.type
                    );
                    inputs[i].transactionUrl =
                        `/${network}/message/${outputResponse.messageId}`;
                }
            }

            outputs.sort((a, b) => a.index - b.index);
        }
        return { inputs, outputs, unlockAddresses, transferTotal };
    }

    public static async getMessageStatus(
        network: string,
        messageId: string,
        tangleCacheService: TangleCacheService): Promise<any> {
        let messageTangleStatus: MessageTangleStatus = "unknown";
        let date: string = "";
        const details = await tangleCacheService.messageDetails(
            network, messageId ?? "");
        if (details) {
            if (details?.metadata) {
                if (details.metadata.milestoneIndex) {
                    messageTangleStatus = "milestone";
                } else if (details.metadata.referencedByMilestoneIndex) {
                    messageTangleStatus = "referenced";
                } else {
                    messageTangleStatus = "pending";
                }
            }
            const milestoneIndex = details?.metadata?.referencedByMilestoneIndex;
            if (milestoneIndex) {
                const result = await tangleCacheService.milestoneDetails(
                    network, milestoneIndex);
                if (result?.timestamp) {
                    date = DateHelper.formatShort(DateHelper.milliseconds(result.timestamp));
                }
            }
        }
        return { messageTangleStatus, date };
    }

}
