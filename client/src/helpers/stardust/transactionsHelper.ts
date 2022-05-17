/* eslint-disable no-warning-comments */
import { BASIC_OUTPUT_TYPE, IAddressUnlockCondition, IStateControllerAddressUnlockCondition,
    IGovernorAddressUnlockCondition, ED25519_ADDRESS_TYPE, IMessage, ISignatureUnlockBlock,
    IUTXOInput, REFERENCE_UNLOCK_BLOCK_TYPE, SIGNATURE_UNLOCK_BLOCK_TYPE,
    TRANSACTION_PAYLOAD_TYPE, ADDRESS_UNLOCK_CONDITION_TYPE, ITransactionPayload,
    IBasicOutput, UnlockConditionTypes, ITreasuryOutput, IAliasOutput, INftOutput, IFoundryOutput,
    TREASURY_OUTPUT_TYPE, STATE_CONTROLLER_ADDRESS_UNLOCK_CONDITION_TYPE,
    GOVERNOR_ADDRESS_UNLOCK_CONDITION_TYPE, ALIAS_OUTPUT_TYPE, NFT_OUTPUT_TYPE } from "@iota/iota.js-stardust";
import { HexHelper, WriteStream } from "@iota/util.js-stardust";
import { DateHelper } from "../../helpers/dateHelper";
import { IInput } from "../../models/api/stardust/IInput";
import { IOutput } from "../../models/api/stardust/IOutput";
import { IBech32AddressDetails } from "../../models/IBech32AddressDetails";
import { MessageTangleStatus } from "../../models/messageTangleStatus";
import { StardustTangleCacheService } from "../../services/stardust/stardustTangleCacheService";
import { Bech32AddressHelper } from "../stardust/bech32AddressHelper";

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
        const remainderOutputs: IOutput[] = [];
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
                        HexHelper.stripPrefix(
                            signatureBlocks[i].signature.publicKey
                        ),
                        ED25519_ADDRESS_TYPE
                    )
                );
            }

            // Inputs
            for (let i = 0; i < payload.essence.inputs.length; i++) {
                let transactionUrl;
                let transactionAddress = unlockAddresses[i];
                const input = payload.essence.inputs[i];
                const isGenesis = input.transactionId === GENESIS_HASH;

                const transactionOutputIndex = input.transactionOutputIndex;
                const toiWriteStream = new WriteStream();
                toiWriteStream.writeUInt16("transactionOutputIndex", transactionOutputIndex);
                const outputHash = input.transactionId + toiWriteStream.finalHex();

                transactionUrl = `/${network}/search/${outputHash}`;

                const inputSearchResponse = await tangleCacheService.search(network, input.transactionId);
                const inputTransaction = inputSearchResponse?.message;
                const amount = (inputTransaction?.payload?.type === TRANSACTION_PAYLOAD_TYPE)
                    ? Number(inputTransaction.payload?.essence.outputs[transactionOutputIndex].amount) : 0;

                const outputResponse = await tangleCacheService.outputDetails(network, outputHash);
                if (outputResponse && outputResponse?.output.type !== TREASURY_OUTPUT_TYPE) {
                    const address: IBech32AddressDetails = TransactionsHelper
                    .bechAddressFromAddressUnlockCondition(outputResponse.output.unlockConditions,
                                                         _bechHrp, outputResponse.output.type);
                    if (address.bech32 !== "") {
                        transactionAddress = address;
                        transactionUrl = `/${network}/message/${outputResponse.messageId}`;
                    }
                }

                inputs.push({
                    ...input,
                    amount,
                    isGenesis,
                    outputHash,
                    transactionUrl,
                    transactionAddress,
                    signature: signatureBlocks[i]?.signature.signature,
                    publicKey: signatureBlocks[i]?.signature.publicKey
                });
            }

            // Outputs
            for (let i = 0; i < payload.essence.outputs.length; i++) {
                if (payload.essence.outputs[i].type === TREASURY_OUTPUT_TYPE) {
                    const output = payload.essence.outputs[i] as ITreasuryOutput;

                    outputs.push({
                        type: transactionMessage.payload.essence.outputs[i].type,
                        output,
                        amount: Number(transactionMessage.payload.essence.outputs[i].amount)
                    });
                } else {
                    const output = payload.essence.outputs[i] as IBasicOutput |
                    IFoundryOutput | IAliasOutput | INftOutput;

                    const address: IBech32AddressDetails = TransactionsHelper
                    .bechAddressFromAddressUnlockCondition(output.unlockConditions, _bechHrp, output.type);

                    const isRemainder = inputs.some(input => input.transactionAddress.bech32 === address.bech32);

                    if (isRemainder) {
                        remainderOutputs.push({
                            type: transactionMessage.payload.essence.outputs[i].type,
                            address,
                            amount: Number(transactionMessage.payload.essence.outputs[i].amount),
                            isRemainder,
                            output
                        });
                    } else {
                        outputs.push({
                            type: transactionMessage.payload.essence.outputs[i].type,
                            address,
                            amount: Number(transactionMessage.payload.essence.outputs[i].amount),
                            isRemainder,
                            output
                        });
                    }

                    if (!isRemainder) {
                        transferTotal += Number(transactionMessage.payload.essence.outputs[i].amount);
                    }
                }
            }
        }

        return { inputs, outputs: [...outputs, ...remainderOutputs], unlockAddresses, transferTotal };
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
                if (result?.milestone?.timestamp) {
                    date = DateHelper.formatShort(DateHelper.milliseconds(result.milestone.timestamp));
                }
            }
        }
        return { messageTangleStatus, date };
    }

    private static bechAddressFromAddressUnlockCondition(
        unlockConditions: UnlockConditionTypes[],
        _bechHrp: string,
        outputType: number
    ): IBech32AddressDetails {
        let address: IBech32AddressDetails = { bech32: "" };
        let unlockCondition;

        if (outputType === BASIC_OUTPUT_TYPE || outputType === NFT_OUTPUT_TYPE) {
            unlockCondition = unlockConditions?.filter(
                ot => ot.type === ADDRESS_UNLOCK_CONDITION_TYPE
            ).map(ot => ot as IAddressUnlockCondition)[0];
        } else if (outputType === ALIAS_OUTPUT_TYPE) {
            if (unlockConditions.some(ot => ot.type === STATE_CONTROLLER_ADDRESS_UNLOCK_CONDITION_TYPE)) {
                unlockCondition = unlockConditions?.filter(
                    ot => ot.type === STATE_CONTROLLER_ADDRESS_UNLOCK_CONDITION_TYPE
                ).map(ot => ot as IStateControllerAddressUnlockCondition)[0];
            }
            if (unlockConditions.some(ot => ot.type === GOVERNOR_ADDRESS_UNLOCK_CONDITION_TYPE)) {
                unlockCondition = unlockConditions?.filter(
                    ot => ot.type === GOVERNOR_ADDRESS_UNLOCK_CONDITION_TYPE
                ).map(ot => ot as IGovernorAddressUnlockCondition)[0];
            }
        }

        if (unlockCondition?.address) {
            address = Bech32AddressHelper.buildAddress(_bechHrp, unlockCondition?.address);
        }

        return address;
    }
}


