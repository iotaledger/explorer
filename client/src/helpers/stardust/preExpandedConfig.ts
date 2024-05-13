import {
    AddressType,
    AddressUnlockCondition,
    AliasOutput,
    AliasUnlock,
    CommonOutput,
    ExpirationUnlockCondition,
    GovernorAddressUnlockCondition,
    StateControllerAddressUnlockCondition,
    Unlock,
    UnlockConditionType,
    UnlockType,
} from "@iota/sdk-wasm-stardust/web";
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

            if (commonOutput.unlockConditions.length > 0) {
                // unlockSignatureAddress is allready calculated in the input
                const unlockSignatureAddress = input.address.bech32;
                // special case for alias unlock where the signature is the state controller address but the unlock condition is the alias address
                const { referencedStateControllerAddress, referencedAliasAddress } = getReferencedAddresses(
                    inputs,
                    unlocks[idx],
                    idx,
                    bech32Hrp,
                );

                preExpandedConfig = {
                    ...preExpandedConfig,
                    unlockConditions: commonOutput.unlockConditions.map((unlockCondition) => {
                        switch (unlockCondition.type) {
                            case UnlockConditionType.Address: {
                                const unlockAddress = Bech32AddressHelper.buildAddress(
                                    bech32Hrp,
                                    (unlockCondition as AddressUnlockCondition).address,
                                )?.bech32;

                                return (
                                    unlockAddress === unlockSignatureAddress ||
                                    (unlockAddress === referencedAliasAddress &&
                                        referencedStateControllerAddress === unlockSignatureAddress)
                                ); // special case for alias unlock
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

function getReferencedAddresses(
    inputs: IInput[],
    unlock: Unlock,
    idx: number,
    bech32Hrp: string,
): { referencedStateControllerAddress: string; referencedAliasAddress: string } {
    let referencedStateControllerAddress = "";
    let referencedAliasAddress = "";
    if (unlock.type === UnlockType.Alias) {
        const referencedAliasInput = inputs[(unlock as AliasUnlock).reference];
        const referencedAliasOutput = referencedAliasInput?.output?.output as unknown as AliasOutput;
        referencedAliasAddress =
            Bech32AddressHelper.buildAddress(bech32Hrp, referencedAliasOutput.aliasId, AddressType.Alias)?.bech32 || "";

        const referencedStateControllerAddressUC = referencedAliasOutput.unlockConditions.find(
            (uc) => uc.type === UnlockConditionType.StateControllerAddress,
        ) as StateControllerAddressUnlockCondition;
        referencedStateControllerAddress =
            Bech32AddressHelper.buildAddress(bech32Hrp, referencedStateControllerAddressUC.address)?.bech32 || "";
    }
    return { referencedStateControllerAddress, referencedAliasAddress };
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
