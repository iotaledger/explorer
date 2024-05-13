/* eslint-disable no-warning-comments */
import {
    AddressUnlockCondition,
    BasicOutput,
    Block,
    CommonOutput,
    FeatureType,
    GovernorAddressUnlockCondition,
    ImmutableAliasAddressUnlockCondition,
    InputType,
    IRent,
    MilestonePayload,
    Output,
    OutputType,
    PayloadType,
    RegularTransactionEssence,
    StateControllerAddressUnlockCondition,
    TagFeature,
    TransactionPayload,
    TreasuryOutput,
    Unlock,
    UnlockCondition,
    UnlockConditionType,
    Utils,
    UTXOInput,
} from "@iota/sdk-wasm-stardust/web";
import bigInt from "big-integer";
import { Converter } from "./convertUtils";
import { HexHelper } from "./hexHelper";
import { IBech32AddressDetails } from "~models/api/IBech32AddressDetails";
import { IInput } from "~models/api/stardust/IInput";
import { IOutput } from "~models/api/stardust/IOutput";
import { MAINNET } from "~models/config/networkType";
import { StardustApiClient } from "~services/stardust/stardustApiClient";
import { Bech32AddressHelper } from "../stardust/bech32AddressHelper";
import { resolveTransitiveUnlock } from "./resolveTransiviteUnlock";

interface TransactionInputsAndOutputsResponse {
    inputs: IInput[];
    unlocks: Unlock[];
    outputs: IOutput[];
    unlockAddresses: IBech32AddressDetails[];
    transferTotal: number;
}

/**
 * The hex encoded word PARTICIPATE.
 */
const HEX_PARTICIPATE = "0x5041525449434950415445";

/**
 * The stardust genesis milestone.
 */
export const STARDUST_GENESIS_MILESTONE = 7669900;

export const STARDUST_SUPPLY_INCREASE_OUTPUT_TICKER = "0xb191c4bc825ac6983789e50545d5ef07a1d293a98ad974fc9498cb18";

export class TransactionsHelper {
    public static async getInputsAndOutputs(
        block: Block | undefined,
        network: string,
        _bechHrp: string,
        apiClient: StardustApiClient,
    ): Promise<TransactionInputsAndOutputsResponse> {
        const GENESIS_HASH = "0".repeat(64);
        const inputs: IInput[] = [];
        let unlocks: Unlock[] = [];
        const outputs: IOutput[] = [];
        const remainderOutputs: IOutput[] = [];
        const unlockAddresses: IBech32AddressDetails[] = [];
        let transferTotal = 0;
        let sortedOutputs: IOutput[] = [];

        if (block?.payload?.type === PayloadType.Transaction) {
            const payload: TransactionPayload = block.payload as TransactionPayload;
            const transactionId = Utils.transactionId(payload);

            // Unlocks
            unlocks = payload.unlocks;

            // unlock Addresses computed from public keys in unlocks
            for (let i = 0; i < unlocks.length; i++) {
                const signatureUnlock = resolveTransitiveUnlock(unlocks, i);

                const address = Bech32AddressHelper.buildAddress(
                    _bechHrp,
                    Utils.hexPublicKeyToBech32Address(signatureUnlock.signature.publicKey, _bechHrp),
                );

                unlockAddresses.push(address);
            }

            const payloadEssence = payload.essence as RegularTransactionEssence;

            // Inputs
            for (let i = 0; i < payloadEssence.inputs.length; i++) {
                let outputDetails;
                let amount;
                let isGenesis = false;
                const address = unlockAddresses[i];
                const input = payloadEssence.inputs[i];

                if (input.type === InputType.UTXO) {
                    const utxoInput = input as UTXOInput;
                    isGenesis = utxoInput.transactionId === GENESIS_HASH;

                    const outputId = Utils.computeOutputId(utxoInput.transactionId, utxoInput.transactionOutputIndex);

                    const response = await apiClient.outputDetails({ network, outputId });
                    const details = response.output;

                    if (!response.error && details?.output && details?.metadata) {
                        outputDetails = {
                            output: details.output,
                            metadata: details.metadata,
                        };
                        amount = Number(details.output.amount);
                    }

                    inputs.push({
                        ...utxoInput,
                        // TODO-sdk Rename the field
                        transactionInputIndex: utxoInput.transactionOutputIndex,
                        amount,
                        isGenesis,
                        outputId,
                        output: outputDetails,
                        address,
                    });
                }
            }

            // Outputs
            for (let i = 0; i < payloadEssence.outputs.length; i++) {
                const outputId = Utils.computeOutputId(transactionId, i);

                if (payloadEssence.outputs[i].type === OutputType.Treasury) {
                    const output = payloadEssence.outputs[i] as TreasuryOutput;

                    outputs.push({
                        id: outputId,
                        output,
                        amount: Number(payloadEssence.outputs[i].amount),
                    });
                } else {
                    const output = payloadEssence.outputs[i] as CommonOutput;

                    const address: IBech32AddressDetails = TransactionsHelper.bechAddressFromAddressUnlockCondition(
                        output.unlockConditions,
                        _bechHrp,
                        output.type,
                    );

                    const isRemainder = inputs.some((input) => input.address.bech32 === address.bech32);

                    if (isRemainder) {
                        remainderOutputs.push({
                            id: outputId,
                            address,
                            amount: Number(payloadEssence.outputs[i].amount),
                            isRemainder,
                            output,
                        });
                    } else {
                        outputs.push({
                            id: outputId,
                            address,
                            amount: Number(payloadEssence.outputs[i].amount),
                            isRemainder,
                            output,
                        });
                    }

                    if (!isRemainder) {
                        transferTotal += Number(payloadEssence.outputs[i].amount);
                    }
                }
            }

            sortedOutputs = [...outputs, ...remainderOutputs];
            this.sortOuputsByIndex(sortedOutputs);
        }

        return { inputs, unlocks, outputs: sortedOutputs, unlockAddresses, transferTotal };
    }

    /**
     * Sort inputs and outputs in assending order by index.
     * @param items Inputs or Outputs.
     */
    public static sortOuputsByIndex(items: IOutput[]) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        items.sort((a: any, b: any) => {
            const firstIndex: string = a.id ? a.id.slice(-4) : a.outputId.slice(-4);
            const secondIndex: string = b.id ? b.id.slice(-4) : b.outputId.slice(-4);
            const firstFormattedIndex = Converter.convertToBigEndian(firstIndex);
            const secondFormattedIndex = Converter.convertToBigEndian(secondIndex);

            return Number.parseInt(firstFormattedIndex, 16) - Number.parseInt(secondFormattedIndex, 16);
        });
    }

    /**
     * Compute BLAKE2b-256 hash for alias.
     * @param aliasId Alias id.
     * @param outputId Output id.
     * @returns The BLAKE2b-256 hash for Alias Id.
     */
    public static buildIdHashForAlias(aliasId: string, outputId: string): string {
        return HexHelper.toBigInt256(aliasId).eq(bigInt.zero) ? Utils.computeAliasId(outputId) : aliasId;
    }

    /**
     * Compute BLAKE2b-256 hash for nft Id.
     * @param nftId Nft id.
     * @param outputId Output id.
     * @returns The BLAKE2b-256 hash for Nft Id.
     */
    public static buildIdHashForNft(nftId: string, outputId: string): string {
        return HexHelper.toBigInt256(nftId).eq(bigInt.zero) ? Utils.computeNftId(outputId) : nftId;
    }

    public static computeStorageDeposit(outputs: Output[], rentStructure: IRent): number {
        const outputsWithoutSdruc = outputs.filter((output) => {
            if (output.type === OutputType.Treasury) {
                return false;
            }
            const hasStorageDepositUnlockCondition = (output as CommonOutput).unlockConditions.some(
                (uc) => uc.type === UnlockConditionType.StorageDepositReturn,
            );

            return !hasStorageDepositUnlockCondition;
        });

        const rentBalance = outputsWithoutSdruc.reduce(
            (acc, output) => acc + Number(Utils.computeStorageDeposit(output, rentStructure)),
            0,
        );
        return rentBalance;
    }

    /**
     * Check if output is used for participation event
     * @param output The output to check.
     * @returns true if participation event output.
     */
    public static isParticipationEventOutput(output: Output): boolean {
        if (output.type === OutputType.Basic) {
            const tagFeature = (output as BasicOutput).features?.find((feature) => feature.type === FeatureType.Tag) as TagFeature;

            if (tagFeature) {
                return tagFeature.tag === HEX_PARTICIPATE;
            }
        }
        return false;
    }

    /**
     * Compute a blockId from a milestone payload.
     * @param protocolVersion The protocol version to use.
     * @param payload The milestone payload.
     * @returns The blockId of the block with the milestone payload.
     */
    public static blockIdFromMilestonePayload(protocolVersion: number, payload: MilestonePayload): string {
        const block = new Block();
        block.protocolVersion = protocolVersion;
        block.parents = payload.parents;
        block.payload = payload;
        block.nonce = "0";

        return Utils.blockId(block);
    }

    /**
     * Check if transaction is from IOTA Stardust Genesis
     * @param network The network.
     * @param milestoneIndex The milestone index of the IOTA stardust genesis.
     * @returns true if transaction is from IOTA stardust genesis.
     */
    public static isTransactionFromIotaStardustGenesis(network: string, milestoneIndex: number): boolean {
        return network === MAINNET && milestoneIndex === STARDUST_GENESIS_MILESTONE;
    }

    private static bechAddressFromAddressUnlockCondition(
        unlockConditions: UnlockCondition[],
        _bechHrp: string,
        outputType: number,
    ): IBech32AddressDetails {
        let address: IBech32AddressDetails = { bech32: "" };
        let unlockCondition;

        if (outputType === OutputType.Basic || outputType === OutputType.Nft) {
            unlockCondition = unlockConditions
                ?.filter((ot) => ot.type === UnlockConditionType.Address)
                .map((ot) => ot as AddressUnlockCondition)[0];
        } else if (outputType === OutputType.Alias) {
            if (unlockConditions.some((ot) => ot.type === UnlockConditionType.StateControllerAddress)) {
                unlockCondition = unlockConditions
                    ?.filter((ot) => ot.type === UnlockConditionType.StateControllerAddress)
                    .map((ot) => ot as StateControllerAddressUnlockCondition)[0];
            }
            if (unlockConditions.some((ot) => ot.type === UnlockConditionType.GovernorAddress)) {
                unlockCondition = unlockConditions
                    ?.filter((ot) => ot.type === UnlockConditionType.GovernorAddress)
                    .map((ot) => ot as GovernorAddressUnlockCondition)[0];
            }
        } else if (outputType === OutputType.Foundry) {
            unlockCondition = unlockConditions
                ?.filter((ot) => ot.type === UnlockConditionType.ImmutableAliasAddress)
                .map((ot) => ot as ImmutableAliasAddressUnlockCondition)[0];
        }

        if (unlockCondition?.address) {
            address = Bech32AddressHelper.buildAddress(_bechHrp, unlockCondition?.address);
        }

        return address;
    }
}
