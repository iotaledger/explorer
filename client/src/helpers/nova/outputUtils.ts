import { CommonOutput, ExpirationUnlockCondition, ProtocolParametersResponse, UnlockConditionType } from "@iota/sdk-wasm-nova/web";
import moment from "moment";
import { unixTimestampToSlotIndexConverter } from "./novaTimeUtils";

/**
 * Check if output has special condition i.e SDRUC, EUC and TUC.
 * @returns special condition exists.
 */
export function hasSpecialCondition(commonOutput: CommonOutput): boolean {
    let specialUnlockConditionExists = false;

    specialUnlockConditionExists = commonOutput.unlockConditions.some(
        (condition) =>
            condition.type === UnlockConditionType.StorageDepositReturn ||
            condition.type === UnlockConditionType.Expiration ||
            condition.type === UnlockConditionType.Timelock,
    );

    return specialUnlockConditionExists;
}

export function isOutputExpired(output: CommonOutput, nodeProtocolParameters: ProtocolParametersResponse | null): boolean | null {
    const expirationUnlockCondition = output.unlockConditions.find(
        (unlockCondition) => unlockCondition.type === UnlockConditionType.Expiration,
    ) as ExpirationUnlockCondition;
    const outputSlotIndex = expirationUnlockCondition?.slotIndex;
    const maxCommittableAge = nodeProtocolParameters?.parameters?.maxCommittableAge ?? null;
    const minCommittableAge = nodeProtocolParameters?.parameters?.minCommittableAge ?? null;

    if (!nodeProtocolParameters || !outputSlotIndex || maxCommittableAge === null || minCommittableAge === null) return null;

    const unixTimestampToSlotIndex = unixTimestampToSlotIndexConverter(nodeProtocolParameters);
    const currentSlotIndex = unixTimestampToSlotIndex(moment().unix());

    if (outputSlotIndex > currentSlotIndex + maxCommittableAge) {
        return false;
    } else if (outputSlotIndex <= currentSlotIndex + minCommittableAge) {
        return true;
    } else {
        // The expiration is in the deadzone where it can't be unlocked
        return null;
    }
}
