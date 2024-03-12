import { BasicOutput, Output, ProtocolParameters, Utils } from "@iota/sdk-wasm-nova/web";
import { IKeyValueEntries } from "~/app/lib/interfaces";

export interface OutputManaDetails {
    storedMana: string;
    storedManaDecayed: string;
    potentialMana: string;
    totalMana: string;
    manaRewards?: string | null;
}

export function buildManaDetailsForOutput(
    output: Output,
    createdSlotIndex: number,
    spentOrLatestSlotIndex: number,
    protocolParameters: ProtocolParameters,
    manaRewards: bigint | null,
): OutputManaDetails {
    const decayedMana = Utils.outputManaWithDecay(output, createdSlotIndex, spentOrLatestSlotIndex, protocolParameters);
    const storedManaDecayed = BigInt(decayedMana.stored).toString();
    const potentialMana = BigInt(decayedMana.potential).toString();
    let totalMana = BigInt(decayedMana.stored) + BigInt(decayedMana.potential);

    if (manaRewards !== null) {
        totalMana += manaRewards;
    }

    return {
        storedMana: (output as BasicOutput).mana?.toString(),
        storedManaDecayed,
        potentialMana,
        manaRewards: manaRewards?.toString() ?? undefined,
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
                label: "Mana Rewards:",
                value: manaDetails?.manaRewards,
            },
        ],
    };
}
