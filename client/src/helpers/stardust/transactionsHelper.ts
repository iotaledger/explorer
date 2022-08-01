/* eslint-disable no-warning-comments */
import { Blake2b } from "@iota/crypto.js-stardust";
import {
    BASIC_OUTPUT_TYPE, IAddressUnlockCondition, IStateControllerAddressUnlockCondition,
    IGovernorAddressUnlockCondition, ED25519_ADDRESS_TYPE, IBlock,
    ISignatureUnlock, REFERENCE_UNLOCK_TYPE, SIGNATURE_UNLOCK_TYPE,
    TRANSACTION_PAYLOAD_TYPE, ADDRESS_UNLOCK_CONDITION_TYPE, ITransactionPayload,
    IBasicOutput, UnlockConditionTypes, ITreasuryOutput, IAliasOutput, INftOutput, IFoundryOutput,
    TREASURY_OUTPUT_TYPE, STATE_CONTROLLER_ADDRESS_UNLOCK_CONDITION_TYPE,
    GOVERNOR_ADDRESS_UNLOCK_CONDITION_TYPE, ALIAS_OUTPUT_TYPE,
    NFT_OUTPUT_TYPE, serializeTransactionPayload, FOUNDRY_OUTPUT_TYPE,
    IMMUTABLE_ALIAS_UNLOCK_CONDITION_TYPE, IImmutableAliasUnlockCondition,
    TransactionHelper, IReferenceUnlock
} from "@iota/iota.js-stardust";
import { Converter, HexHelper, WriteStream } from "@iota/util.js-stardust";
import { DateHelper } from "../../helpers/dateHelper";
import { IBech32AddressDetails } from "../../models/api/IBech32AddressDetails";
import { IInput } from "../../models/api/stardust/IInput";
import { IOutput } from "../../models/api/stardust/IOutput";
import { TangleStatus } from "../../models/tangleStatus";
import { StardustTangleCacheService } from "../../services/stardust/stardustTangleCacheService";
import { Bech32AddressHelper } from "../stardust/bech32AddressHelper";

interface TransactionInputsAndOutputsResponse {
    inputs: IInput[];
    unlocks: ISignatureUnlock[];
    outputs: IOutput[];
    unlockAddresses: IBech32AddressDetails[];
    transferTotal: number;
}

export class TransactionsHelper {
    public static async getInputsAndOutputs(block: IBlock | undefined, network: string,
                                            _bechHrp: string, tangleCacheService: StardustTangleCacheService
                                           ): Promise<TransactionInputsAndOutputsResponse> {
        const GENESIS_HASH = "0".repeat(64);
        const inputs: IInput[] = [];
        const unlocks: ISignatureUnlock[] = [];
        const outputs: IOutput[] = [];
        const remainderOutputs: IOutput[] = [];
        const unlockAddresses: IBech32AddressDetails[] = [];
        let transferTotal = 0;

        if (block?.payload?.type === TRANSACTION_PAYLOAD_TYPE) {
            const payload: ITransactionPayload = block.payload;
            const transactionId = TransactionsHelper.computeTransactionIdFromTransactionPayload(payload);

            // Signatures
            for (let i = 0; i < payload.unlocks.length; i++) {
                const unlock = payload.unlocks[i];
                if (unlock.type === SIGNATURE_UNLOCK_TYPE) {
                    unlocks.push(unlock);
                } else if (unlock.type === REFERENCE_UNLOCK_TYPE) {
                    let refUnlockIdx = i;
                    let signatureUnlock: ISignatureUnlock;
                    // unlock references can be transitive,
                    // so we need to follow the path until we find the signature
                    do {
                        const referenceUnlock = payload.unlocks[refUnlockIdx] as IReferenceUnlock;
                        signatureUnlock = payload.unlocks[referenceUnlock.reference] as ISignatureUnlock;
                        refUnlockIdx = referenceUnlock.reference;
                    } while (!signatureUnlock.signature);

                    unlocks.push(signatureUnlock);
                }
            }

            // unlock Addresses computed from public keys in unlocks
            for (let i = 0; i < unlocks.length; i++) {
                unlockAddresses.push(
                    Bech32AddressHelper.buildAddress(
                        _bechHrp,
                        HexHelper.stripPrefix(
                            unlocks[i].signature.publicKey
                        ),
                        ED25519_ADDRESS_TYPE
                    )
                );
            }

            // Inputs
            for (let i = 0; i < payload.essence.inputs.length; i++) {
                let amount = 0;
                const address = unlockAddresses[i];
                const input = payload.essence.inputs[i];
                const isGenesis = input.transactionId === GENESIS_HASH;

                const outputId = TransactionHelper.outputIdFromTransactionData(
                    input.transactionId,
                    input.transactionOutputIndex
                );

                const outputResponse = await tangleCacheService.outputDetails(network, outputId);

                if (outputResponse) {
                    amount = Number(outputResponse.output.amount);
                }

                inputs.push({
                    ...input,
                    amount,
                    isGenesis,
                    outputId,
                    output: outputResponse,
                    address
                });
            }

            // Outputs
            for (let i = 0; i < payload.essence.outputs.length; i++) {
                const outputId = TransactionHelper.outputIdFromTransactionData(transactionId, i);

                if (payload.essence.outputs[i].type === TREASURY_OUTPUT_TYPE) {
                    const output = payload.essence.outputs[i] as ITreasuryOutput;

                    outputs.push({
                        id: outputId,
                        output,
                        amount: Number(payload.essence.outputs[i].amount)
                    });
                } else {
                    const output = payload.essence.outputs[i] as IBasicOutput |
                    IFoundryOutput | IAliasOutput | INftOutput;

                    const address: IBech32AddressDetails = TransactionsHelper
                    .bechAddressFromAddressUnlockCondition(output.unlockConditions, _bechHrp, output.type);

                    const isRemainder = inputs.some(input => input.address.bech32 === address.bech32);

                    if (isRemainder) {
                        remainderOutputs.push({
                            id: outputId,
                            address,
                            amount: Number(payload.essence.outputs[i].amount),
                            isRemainder,
                            output
                        });
                    } else {
                        outputs.push({
                            id: outputId,
                            address,
                            amount: Number(payload.essence.outputs[i].amount),
                            isRemainder,
                            output
                        });
                    }

                    if (!isRemainder) {
                        transferTotal += Number(payload.essence.outputs[i].amount);
                    }
                }
            }
        }

        return { inputs, unlocks, outputs: [...outputs, ...remainderOutputs], unlockAddresses, transferTotal };
    }

    public static computeTransactionIdFromTransactionPayload(payload: ITransactionPayload) {
        const tpWriteStream = new WriteStream();
        serializeTransactionPayload(tpWriteStream, payload);
        return Converter.bytesToHex(Blake2b.sum256(tpWriteStream.finalBytes()), true);
    }

    public static async getMessageStatus(
        network: string,
        blockId: string,
        tangleCacheService: StardustTangleCacheService
    ): Promise<{ blockTangleStatus: TangleStatus; date: string }> {
        let blockTangleStatus: TangleStatus = "unknown";
        let date: string = "";
        const details = await tangleCacheService.blockDetails(network, blockId);
        if (details) {
            if (details?.metadata) {
                if (details.metadata.milestoneIndex) {
                    blockTangleStatus = "milestone";
                } else if (details.metadata.referencedByMilestoneIndex) {
                    blockTangleStatus = "referenced";
                } else {
                    blockTangleStatus = "pending";
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
        return { blockTangleStatus, date };
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
        } else if (outputType === FOUNDRY_OUTPUT_TYPE) {
            unlockCondition = unlockConditions?.filter(
                ot => ot.type === IMMUTABLE_ALIAS_UNLOCK_CONDITION_TYPE
            ).map(ot => ot as IImmutableAliasUnlockCondition)[0];
        }

        if (unlockCondition?.address) {
            address = Bech32AddressHelper.buildAddress(_bechHrp, unlockCondition?.address);
        }

        return address;
    }
}


