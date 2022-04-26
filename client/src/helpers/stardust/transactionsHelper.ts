/* eslint-disable no-warning-comments */
import { BASIC_OUTPUT_TYPE, IAddressUnlockCondition, Ed25519Address,
    ED25519_ADDRESS_TYPE, IMessage, ISignatureUnlockBlock,
    IUTXOInput, REFERENCE_UNLOCK_BLOCK_TYPE, SIGNATURE_UNLOCK_BLOCK_TYPE,
    TRANSACTION_PAYLOAD_TYPE, ADDRESS_UNLOCK_CONDITION_TYPE, ITransactionPayload,
    IBasicOutput, UnlockConditionTypes } from "@iota/iota.js-stardust";
import { Converter, HexHelper, WriteStream } from "@iota/util.js-stardust";
import { DateHelper } from "../../helpers/dateHelper";
import { IInput } from "../../models/api/stardust/IInput";
import { IOutput } from "../../models/api/stardust/IOutput";
import { IBech32AddressDetails } from "../../models/IBech32AddressDetails";
import { MessageTangleStatus } from "../../models/messageTangleStatus";
import { StardustTangleCacheService } from "../../services/stardust/stardustTangleCacheService";
import { Bech32AddressHelper } from ".././bech32AddressHelper";

interface TransactionInputsAndOutputsResponse {
    inputs: (IUTXOInput & IInput)[];
    outputs: IOutput[];
    unlockAddresses: IBech32AddressDetails[];
    transferTotal: number;
}

export class TransactionsHelper {
    public static async getInputsAndOutputs(transactionMessage: IMessage | undefined, network: string,
                                            _bechHrp: string, tangleCacheService: StardustTangleCacheService
                                           ): Promise<TransactionInputsAndOutputsResponse> {
        const GENESIS_HASH = "0".repeat(64);
        const inputs: (IUTXOInput & IInput)[] = [];
        const outputs: IOutput[] = [];
        const unlockAddresses: IBech32AddressDetails[] = [];
        let transferTotal = 0;

        if (transactionMessage?.payload?.type === TRANSACTION_PAYLOAD_TYPE) {
            const payload: ITransactionPayload = transactionMessage.payload;
            const signatureBlocks: ISignatureUnlockBlock[] = [];

            // Signatures
            for (let i = 0; i < payload.unlockBlocks.length; i++) {
                const unlockBlock = payload.unlockBlocks[i];
                if (unlockBlock.type === SIGNATURE_UNLOCK_BLOCK_TYPE) {
                    signatureBlocks.push(unlockBlock);
                } else if (unlockBlock.type === REFERENCE_UNLOCK_BLOCK_TYPE) {
                    signatureBlocks.push(payload.unlockBlocks[unlockBlock.reference] as ISignatureUnlockBlock);
                }
            }

            // Unlock Addresses (Computed from public keys in UnlockBlocks)
            for (let i = 0; i < signatureBlocks.length; i++) {
                unlockAddresses.push(
                    Bech32AddressHelper.buildAddress(
                        _bechHrp,
                        Converter.bytesToHex(
                            new Ed25519Address(Converter.hexToBytes(signatureBlocks[i].signature.publicKey)).toAddress()
                        ),
                        ED25519_ADDRESS_TYPE
                    )
                );
            }

            // Inputs
            for (let i = 0; i < payload.essence.inputs.length; i++) {
                const input = payload.essence.inputs[i];
                const isGenesis = input.transactionId === GENESIS_HASH;

                const transactionOutputIndex = input.transactionOutputIndex;
                const outputIndexWriteStream = new WriteStream();
                outputIndexWriteStream.writeUInt16("transactionOutputIndex", transactionOutputIndex);
                const outputHash = input.transactionId + outputIndexWriteStream.finalHex();

                const inputSearchResponse = await tangleCacheService.search(network, input.transactionId);
                const inputTransaction = inputSearchResponse?.message;
                const amount = (inputTransaction?.payload?.type === TRANSACTION_PAYLOAD_TYPE)
                    ? Number(inputTransaction.payload?.essence.outputs[transactionOutputIndex].amount) : 0;

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

            // Outputs
            let remainderIndex = 1000;
            for (let i = 0; i < payload.essence.outputs.length; i++) {
                if (payload.essence.outputs[i].type === BASIC_OUTPUT_TYPE) {
                    const basicOutput = payload.essence.outputs[i] as IBasicOutput;

                    const address: IBech32AddressDetails = TransactionsHelper
                    .bechAddressFromAddressUnlockCondition(basicOutput.unlockConditions, _bechHrp);

                    const isRemainder = inputs.some(input => input.transactionAddress.bech32 === address.bech32);

                    outputs.push({
                        index: isRemainder ? (remainderIndex++) + i : i,
                        type: transactionMessage.payload.essence.outputs[i].type,
                        address,
                        amount: Number(transactionMessage.payload.essence.outputs[i].amount),
                        isRemainder,
                        output: basicOutput
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

                if (outputResponse?.output.type === BASIC_OUTPUT_TYPE) {
                    const address: IBech32AddressDetails = TransactionsHelper
                    .bechAddressFromAddressUnlockCondition(outputResponse.output.unlockConditions, _bechHrp);

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

    private static bechAddressFromAddressUnlockCondition(
        unlockConditions: UnlockConditionTypes[],
        _bechHrp: string
    ): IBech32AddressDetails {
        let address: IBech32AddressDetails = { bech32: "" };

        // Address unlock condition is mandatory, also there can be only one
        const addressUnlockCondition = unlockConditions?.filter(
            ot => ot.type === ADDRESS_UNLOCK_CONDITION_TYPE
        ).map(ot => ot as IAddressUnlockCondition)[0];

        if (addressUnlockCondition.address.type === ED25519_ADDRESS_TYPE) {
            const pubKeyHash = HexHelper.stripPrefix(addressUnlockCondition.address.pubKeyHash);
            address = Bech32AddressHelper.buildAddress(_bechHrp, pubKeyHash, ED25519_ADDRESS_TYPE);
        }

        return address;
    }
}


