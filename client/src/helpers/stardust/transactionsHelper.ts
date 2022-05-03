/* eslint-disable no-warning-comments */
import { IBasicOutput, BASIC_OUTPUT_TYPE, IAddressUnlockCondition, Ed25519Address, ED25519_ADDRESS_TYPE, IMessage,
    IReferenceUnlockBlock, ISignatureUnlockBlock, IUTXOInput, REFERENCE_UNLOCK_BLOCK_TYPE, SIGNATURE_UNLOCK_BLOCK_TYPE,
    TRANSACTION_PAYLOAD_TYPE, ADDRESS_UNLOCK_CONDITION_TYPE } from "@iota/iota.js-stardust";
import { Converter, WriteStream } from "@iota/util.js-stardust";
import { DateHelper } from "../../helpers/dateHelper";
import { IBech32AddressDetails } from "../../models/IBech32AddressDetails";
import { MessageTangleStatus } from "../../models/messageTangleStatus";
import { StardustTangleCacheService } from "../../services/stardust/stardustTangleCacheService";
import { Bech32AddressHelper } from ".././bech32AddressHelper";

export interface Input {
    outputHash: string;
    isGenesis: boolean;
    transactionUrl: string;
    transactionAddress: IBech32AddressDetails;
    signature: string;
    publicKey: string;
    amount: number;
}

export interface Output {
    index: number; type: 2 | 3 | 4 | 5 | 6; address: IBech32AddressDetails; amount: number; isRemainder: boolean;
}
export class TransactionsHelper {
    public static async getInputsAndOutputs(
        transactionMessage: IMessage | undefined,
        network: string, _bechHrp: string, tangleCacheService: StardustTangleCacheService):
        Promise<{
            inputs: (IUTXOInput & Input)[];
            outputs: Output[];
            unlockAddresses: IBech32AddressDetails[];
            transferTotal: number;
        }> {
        const inputs: (IUTXOInput & Input)[] = [];
        const outputs: Output[] = [];
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

            // Unlock Addresses (Addresses computed from public keys in UnlockBlocks)
            for (let i = 0; i < signatureBlocks.length; i++) {
                unlockAddresses.push(
                    Bech32AddressHelper.buildAddress(
                        _bechHrp,
                        Converter.bytesToHex(
                            new Ed25519Address(Converter.hexToBytes(signatureBlocks[i].signature.publicKey))
                                .toAddress()
                        ),
                        ED25519_ADDRESS_TYPE
                    )
                );
            }

            // Inputs
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
                if (transactionResult?.message &&
                    transactionResult?.message.payload?.type === TRANSACTION_PAYLOAD_TYPE) {
                    amount = Number(transactionResult.message.payload?.essence.outputs[transactionOutputIndex].amount);
                }

                inputs.push({
                    ...input,
                    amount,
                    isGenesis,
                    outputHash,
                    transactionUrl: `/${network}/search/${outputHash}`,
                    transactionAddress: unlockAddresses[i],
                    signature: signatureBlocks[i]?.signature.signature,
                    publicKey: signatureBlocks[i]?.signature.publicKey
                });
            }

            let remainderIndex = 1000;

            // Outputs
            for (let i = 0; i < transactionMessage.payload.essence.outputs.length; i++) {
                if (transactionMessage.payload.essence.outputs[i].type === BASIC_OUTPUT_TYPE) {
                    const basicOutput = transactionMessage.payload.essence.outputs[i] as IBasicOutput;

                    const addressUnlockConditions = basicOutput.unlockConditions?.filter(
                        ot => ot.type === ADDRESS_UNLOCK_CONDITION_TYPE).map(ot => ot as IAddressUnlockCondition);

                    // TODO Support other address types in addres unlock condition
                    let address: IBech32AddressDetails = { bech32: "" };
                    if (addressUnlockConditions.length > 0 &&
                        addressUnlockConditions[0].address.type === ED25519_ADDRESS_TYPE) {
                        const pubKeyHash = addressUnlockConditions[0].address.pubKeyHash.startsWith("0x")
                            ? addressUnlockConditions[0].address.pubKeyHash.slice(2)
                                : addressUnlockConditions[0].address.pubKeyHash;

                        address = Bech32AddressHelper.buildAddress(
                            _bechHrp,
                            pubKeyHash,
                            ED25519_ADDRESS_TYPE);
                    }

                    const isRemainder = address !== null &&
                        inputs.some(input => input.transactionAddress.bech32 === address.bech32);

                    outputs.push({
                        index: isRemainder ? (remainderIndex++) + i : i,
                        type: transactionMessage.payload.essence.outputs[i].type,
                        address,
                        amount: Number(transactionMessage.payload.essence.outputs[i].amount),
                        isRemainder
                    });
                    if (!isRemainder) {
                        transferTotal += Number(transactionMessage.payload.essence.outputs[i].amount);
                    }
                }
            }

            for (let i = 0; i < inputs.length; i++) {
                const outputResponse = await tangleCacheService.outputDetails(
                    network, inputs[i].outputHash
                );

                if (outputResponse?.output && outputResponse.output.type === BASIC_OUTPUT_TYPE) {
                    const addressUnlockConditions = outputResponse.output.unlockConditions?.filter(
                        ot => ot.type === ADDRESS_UNLOCK_CONDITION_TYPE
                    ).map(ot => ot as IAddressUnlockCondition);
                    // TODO Support other address types in addres unlock condition
                    // TODO Remove copypasta with above
                    let address: IBech32AddressDetails = { bech32: "" };
                    if (addressUnlockConditions.length > 0 &&
                        addressUnlockConditions[0].address.type === ED25519_ADDRESS_TYPE) {
                        const pubKeyHash = addressUnlockConditions[0].address.pubKeyHash.startsWith("0x")
                            ? addressUnlockConditions[0].address.pubKeyHash.slice(2)
                                : addressUnlockConditions[0].address.pubKeyHash;

                        address = Bech32AddressHelper.buildAddress(
                            _bechHrp,
                            pubKeyHash,
                            ED25519_ADDRESS_TYPE);
                    }

                    if (address.bech32 !== "") {
                        inputs[i].transactionAddress = address;
                        inputs[i].transactionUrl = `/${network}/message/${outputResponse.messageId}`;
                    }
                }
            }

            outputs.sort((a, b) => a.index - b.index);
        }
        return { inputs, outputs, unlockAddresses, transferTotal };
    }

    public static async getMessageStatus(
        network: string,
        messageId: string,
        tangleCacheService: StardustTangleCacheService
    ): Promise<{ messageTangleStatus: MessageTangleStatus; date: string }> {
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

