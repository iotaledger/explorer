import {
    AddressUnlockCondition,
    CommonOutput,
    ExpirationUnlockCondition,
    GovernorAddressUnlockCondition,
    ReferenceUnlock,
    SignatureUnlock,
    StateControllerAddressUnlockCondition,
    Unlock,
    UnlockConditionType,
    UnlockType,
    Utils,
} from "@iota/sdk-wasm/web";
import { Bech32AddressHelper } from "~/helpers/stardust/bech32AddressHelper";
import { IInput } from "~models/api/stardust/IInput";
import { IOutput } from "~models/api/stardust/IOutput";
import { IPreExpandedConfig } from "~models/components";

const OUTPUT_EXPAND_CONDITIONS: UnlockConditionType[] = [
    UnlockConditionType.Address,
    UnlockConditionType.StateControllerAddress,
    UnlockConditionType.GovernorAddress,
];
const INPUT_EXPAND_CONDITIONS: UnlockConditionType[] = [...OUTPUT_EXPAND_CONDITIONS, UnlockConditionType.Expiration];

/**
 * Get the preExpandedConfig for the inputs.
 * Expand the input and its unlock conditions if, given the unlocks, we match unlock conditions.
 * @param inputs The inputs to calculate the preExpandedConfig for.
 * @param unlocks The unlocks used to spend the inputs.
 * @param bech32Hrp The bech32 hrp.
 * @returns The preExpandedConfig for the inputs.
 */
export function getInputsPreExpandedConfig(inputs: IInput[], unlocks: Unlock[], bech32Hrp: string): IPreExpandedConfig[] {
    const inputsPreExpandedConfig: IPreExpandedConfig[] = inputs.map((input, idx) => {
        const commonOutput = input?.output?.output as unknown as CommonOutput;
        let preExpandedConfig: IPreExpandedConfig = {};
        if (commonOutput) {
            const matchExpandCondition = commonOutput.unlockConditions?.find((unlockCondition) =>
                INPUT_EXPAND_CONDITIONS.includes(unlockCondition.type),
            );
            preExpandedConfig = {
                isPreExpanded: !!matchExpandCondition,
            };
            if (input?.output?.output && "unlockConditions" in input.output.output) {
                const commmonOutput = input.output.output as unknown as CommonOutput;
                let unlock = unlocks[idx];
                if (unlock.type === UnlockType.Reference) {
                    const referenceUnlock = unlock as ReferenceUnlock;
                    unlock = unlocks[referenceUnlock.reference];
                }
                const unlockSignatureAddress = Utils.hexPublicKeyToBech32Address(
                    (unlock as SignatureUnlock).signature.publicKey,
                    bech32Hrp,
                );
                preExpandedConfig = {
                    ...preExpandedConfig,
                    unlockConditions: commmonOutput.unlockConditions?.map((unlockCondition) => {
                        switch (unlockCondition.type) {
                            case UnlockConditionType.Address: {
                                const unlockAddress = Bech32AddressHelper.buildAddress(
                                    bech32Hrp,
                                    (unlockCondition as AddressUnlockCondition).address,
                                )?.bech32;
                                return unlockAddress === unlockSignatureAddress;
                            }
                            case UnlockConditionType.Expiration: {
                                const unlockAddress = Bech32AddressHelper.buildAddress(
                                    bech32Hrp,
                                    (unlockCondition as ExpirationUnlockCondition).returnAddress,
                                )?.bech32;
                                return unlockAddress === unlockSignatureAddress;
                            }
                            case UnlockConditionType.StateControllerAddress: {
                                const unlockAddress = Bech32AddressHelper.buildAddress(
                                    bech32Hrp,
                                    (unlockCondition as StateControllerAddressUnlockCondition).address,
                                )?.bech32;
                                return unlockAddress === unlockSignatureAddress;
                            }
                            case UnlockConditionType.GovernorAddress: {
                                const unlockAddress = Bech32AddressHelper.buildAddress(
                                    bech32Hrp,
                                    (unlockCondition as GovernorAddressUnlockCondition).address,
                                )?.bech32;
                                return unlockAddress === unlockSignatureAddress;
                            }
                            default:
                                return false;
                        }
                    }),
                };
            }
        }
        return preExpandedConfig;
    });
    return inputsPreExpandedConfig;
}

/**
 * Get the preExpandedConfig for the outputs.
 * Expand the output and its relevant receiver address related unlock conditions.
 * @param outputs The outputs to calculate the preExpandedConfig for.
 * @returns The preExpandedConfig for the outputs.
 */
export function getOutputsPreExpandedConfig(outputs: IOutput[]): IPreExpandedConfig[] {
    const outputsPreExpandedConfig: IPreExpandedConfig[] = outputs.map((output) => {
        const commonOutput = output.output as CommonOutput;
        let preExpandedConfig: IPreExpandedConfig = {};
        if (commonOutput) {
            const matchExpandCondition = commonOutput.unlockConditions?.find((unlockCondition) =>
                OUTPUT_EXPAND_CONDITIONS.includes(unlockCondition.type),
            );
            preExpandedConfig = {
                isPreExpanded: !!matchExpandCondition,
            };
            preExpandedConfig = {
                ...preExpandedConfig,
                unlockConditions: commonOutput.unlockConditions?.map((unlockCondition) =>
                    OUTPUT_EXPAND_CONDITIONS.includes(unlockCondition.type),
                ),
            };
        }
        return preExpandedConfig;
    });
    return outputsPreExpandedConfig;
}
