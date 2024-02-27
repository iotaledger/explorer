import { BasicOutput, ManaRewardsResponse, Output, ProtocolParameters, Utils } from "@iota/sdk-wasm-nova/web";
import { IKeyValueEntries } from "~/app/lib/interfaces";

export interface OutputManaDetails {
    storedMana: string;
    storedManaDecayed: string;
    potentialMana: string;
    totalMana: string;
    delegationRewards?: string | null;
}

export function buildManaDetailsForOutput(
    output: Output,
    createdSlotIndex: number,
    spentOrLatestSlotIndex: number,
    protocolParameters: ProtocolParameters,
    outputManaRewards: ManaRewardsResponse | null,
): OutputManaDetails {
    const decayedMana = Utils.outputManaWithDecay(output, createdSlotIndex, spentOrLatestSlotIndex, protocolParameters);
    const storedManaDecayed = BigInt(decayedMana.stored).toString();
    const potentialMana = BigInt(decayedMana.potential).toString();
    const delegationRewards = outputManaRewards && BigInt(outputManaRewards?.rewards) > 0 ? BigInt(outputManaRewards?.rewards) : null;
    let totalMana = BigInt(decayedMana.stored) + BigInt(decayedMana.potential);

    if (delegationRewards !== null) {
        totalMana += delegationRewards;
    }

    return {
        storedMana: (output as BasicOutput).mana?.toString(),
        storedManaDecayed,
        potentialMana,
        delegationRewards: delegationRewards !== null ? delegationRewards?.toString() : undefined,
        totalMana: totalMana.toString(),
    };
}

export function getManaKeyValueEntries(manaDetails: OutputManaDetails | null): IKeyValueEntries {
    const showDecayMana = manaDetails?.storedMana && manaDetails?.storedManaDecayed;
    const decay = showDecayMana ? Number(manaDetails?.storedMana ?? 0) - Number(manaDetails?.storedManaDecayed ?? 0) : undefined;

    return {
        label: "Mana:",
        value: manaDetails?.totalMana,
        entries: [
            {
                label: "Stored:",
                value: manaDetails?.storedMana,
            },
            {
                label: "Decay:",
                value: decay,
            },
            {
                label: "Potential:",
                value: manaDetails?.potentialMana,
            },
            {
                label: "Delegation Rewards:",
                value: manaDetails?.delegationRewards,
            },
        ],
    };
}
