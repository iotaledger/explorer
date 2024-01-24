import {
    AddressUnlockCondition,
    BasicBlockBody,
    Block,
    BlockBodyType,
    CommonOutput,
    DelegationOutput,
    GovernorAddressUnlockCondition,
    ImmutableAccountAddressUnlockCondition,
    InputType,
    OutputType,
    PayloadType,
    SignatureUnlock,
    SignedTransactionPayload,
    StateControllerAddressUnlockCondition,
    UnlockCondition,
    UnlockConditionType,
    UnlockType,
    Utils,
    UTXOInput,
} from "@iota/sdk-wasm-nova/web";
import { IBech32AddressDetails } from "~/models/api/IBech32AddressDetails";
import { IInput } from "~/models/api/nova/IInput";
import { IOutput } from "~/models/api/nova/IOutput";
import { NovaApiClient } from "~/services/nova/novaApiClient";
import { Bech32AddressHelper } from "../stardust/bech32AddressHelper";
import { Converter } from "../stardust/convertUtils";

interface TransactionInputsAndOutputsResponse {
    inputs: IInput[];
    outputs: IOutput[];
    unlockAddresses: IBech32AddressDetails[];
    transferTotal: number;
}

export class TransactionsHelper {
    public static async getInputsAndOutputs(
        block: Block | undefined,
        network: string,
        _bechHrp: string,
        apiClient: NovaApiClient,
    ): Promise<TransactionInputsAndOutputsResponse> {
        const GENESIS_HASH = "0".repeat(64);
        const inputs: IInput[] = [];
        const outputs: IOutput[] = [];
        const remainderOutputs: IOutput[] = [];
        const unlockAddresses: IBech32AddressDetails[] = [];
        let transferTotal = 0;
        let sortedOutputs: IOutput[] = [];

        if (block?.body.type === BlockBodyType.Basic && (block?.body as BasicBlockBody).payload?.type === PayloadType.SignedTransaction) {
            const payload: SignedTransactionPayload = (block?.body as BasicBlockBody).payload as SignedTransactionPayload;
            const transactionId = Utils.transactionId(payload);

            // Unlocks
            const unlocks = payload.unlocks;

            // unlock Addresses computed from public keys in unlocks
            for (let i = 0; i < unlocks.length; i++) {
                const unlock = unlocks[i];
                let signatureUnlock: SignatureUnlock | undefined;

                if (unlock.type === UnlockType.Signature) {
                    signatureUnlock = unlock as SignatureUnlock;
                } else {
                    let refUnlockIdx = i;
                    // unlock references can be transitive,
                    // so we need to follow the path until we find the signature
                    do {
                        const referencedUnlock = unlocks[refUnlockIdx];

                        if (referencedUnlock.type === UnlockType.Signature) {
                            signatureUnlock = referencedUnlock as SignatureUnlock;
                        } else if (referencedUnlock.type === UnlockType.Multi || referencedUnlock.type === UnlockType.Empty) {
                            break;
                        } else {
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            refUnlockIdx = (referencedUnlock as any).reference;
                        }
                    } while (!signatureUnlock);
                }
                if (signatureUnlock) {
                    unlockAddresses.push(
                        Bech32AddressHelper.buildAddress(
                            _bechHrp,
                            Utils.hexPublicKeyToBech32Address(signatureUnlock.signature.publicKey, _bechHrp),
                        ),
                    );
                }
            }

            const transaction = payload.transaction;

            // Inputs
            for (let i = 0; i < transaction.inputs.length; i++) {
                let outputDetails;
                let amount;
                let isGenesis = false;
                const address = unlockAddresses[i];
                const input = transaction.inputs[i];

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
            for (let i = 0; i < transaction.outputs.length; i++) {
                const outputId = Utils.computeOutputId(transactionId, i);

                if (transaction.outputs[i].type === OutputType.Delegation) {
                    const output = transaction.outputs[i] as DelegationOutput;

                    outputs.push({
                        id: outputId,
                        output,
                        amount: Number(transaction.outputs[i].amount),
                    });
                } else {
                    const output = transaction.outputs[i] as CommonOutput;

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
                            amount: Number(transaction.outputs[i].amount),
                            isRemainder,
                            output,
                        });
                    } else {
                        outputs.push({
                            id: outputId,
                            address,
                            amount: Number(transaction.outputs[i].amount),
                            isRemainder,
                            output,
                        });
                    }

                    if (!isRemainder) {
                        transferTotal += Number(transaction.outputs[i].amount);
                    }
                }
            }

            sortedOutputs = [...outputs, ...remainderOutputs];
            this.sortInputsAndOuputsByIndex(sortedOutputs);
            this.sortInputsAndOuputsByIndex(inputs);
        }

        return { inputs, outputs: sortedOutputs, unlockAddresses, transferTotal };
    }

    /**
     * Sort inputs and outputs in assending order by index.
     * @param items Inputs or Outputs.
     */
    public static sortInputsAndOuputsByIndex(items: IInput[] | IOutput[]) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        items.sort((a: any, b: any) => {
            const firstIndex: string = a.id ? a.id.slice(-4) : a.outputId.slice(-4);
            const secondIndex: string = b.id ? b.id.slice(-4) : b.outputId.slice(-4);
            const firstFormattedIndex = Converter.convertToBigEndian(firstIndex);
            const secondFormattedIndex = Converter.convertToBigEndian(secondIndex);

            return Number.parseInt(firstFormattedIndex, 16) - Number.parseInt(secondFormattedIndex, 16);
        });
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
        } else if (outputType === OutputType.Account) {
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
                ?.filter((ot) => ot.type === UnlockConditionType.ImmutableAccountAddress)
                .map((ot) => ot as ImmutableAccountAddressUnlockCondition)[0];
        }

        if (unlockCondition?.address) {
            address = { bech32: unlockCondition?.address.toString() };
        }

        return address;
    }
}
