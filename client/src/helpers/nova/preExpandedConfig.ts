import {
    AccountOutput,
    AccountUnlock,
    AddressType,
    AddressUnlockCondition,
    CommonOutput,
    ExpirationUnlockCondition,
    GovernorAddressUnlockCondition,
    Output,
    StateControllerAddressUnlockCondition,
    Unlock,
    UnlockConditionType,
    UnlockType,
} from "@iota/sdk-wasm-nova/web";
import { AddressHelper } from "~/helpers/nova/addressHelper";
import { IInput } from "~models/api/nova/IInput";
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
                const unlockSignatureAddress = input.address.bech32;

                preExpandedConfig = {
                    ...preExpandedConfig,
                    unlockConditions: commonOutput.unlockConditions.map((unlockCondition) => {
                        switch (unlockCondition.type) {
                            case UnlockConditionType.Address: {
                                const unlockAddress = AddressHelper.buildAddress(
                                    bech32Hrp,
                                    (unlockCondition as AddressUnlockCondition).address,
                                )?.bech32;

                                // special case for account unlock
                                const referencedAccountAddress = getReferencedAddress(inputs, unlocks[idx], bech32Hrp);

                                return unlockAddress === unlockSignatureAddress || unlockAddress === referencedAccountAddress;
                            }
                            case UnlockConditionType.Expiration: {
                                const unlockAddress = AddressHelper.buildAddress(
                                    bech32Hrp,
                                    (unlockCondition as ExpirationUnlockCondition).returnAddress,
                                )?.bech32;
                                return unlockAddress === unlockSignatureAddress;
                            }
                            case UnlockConditionType.StateControllerAddress: {
                                const unlockAddress = AddressHelper.buildAddress(
                                    bech32Hrp,
                                    (unlockCondition as StateControllerAddressUnlockCondition).address,
                                )?.bech32;
                                return unlockAddress === unlockSignatureAddress;
                            }
                            case UnlockConditionType.GovernorAddress: {
                                const unlockAddress = AddressHelper.buildAddress(
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

function getReferencedAddress(inputs: IInput[], unlock: Unlock, bech32Hrp: string): string {
    let referencedAccountAddress = "";
    if (unlock.type === UnlockType.Account) {
        const referencedAccountInput = inputs[(unlock as AccountUnlock).reference];
        const referencedAccountOutput = referencedAccountInput?.output?.output as unknown as AccountOutput;
        if (referencedAccountOutput?.accountId) {
            referencedAccountAddress =
                AddressHelper.buildAddress(bech32Hrp, referencedAccountOutput.accountId, AddressType.Account)?.bech32 || "";
        }
    }
    return referencedAccountAddress;
}

/**
 * Get the preExpandedConfig for the outputs.
 * Expand the output and its relevant receiver address related unlock conditions.
 * @param outputs The outputs to calculate the preExpandedConfig for.
 * @returns The preExpandedConfig for the outputs.
 */
export function getOutputsPreExpandedConfig(outputs: Output[]): IPreExpandedConfig[] {
    const outputsPreExpandedConfig: IPreExpandedConfig[] = outputs.map((output) => {
        const commonOutput = output as CommonOutput;
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
