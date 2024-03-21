import { BaseTokenResponse, BasicOutput, Output, ProtocolParameters, Utils } from "@iota/sdk-wasm-nova/web";
import { IKeyValueEntries } from "~/app/lib/interfaces";
import { formatAmount } from "../stardust/valueFormatHelper";
import React from "react";

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

export function getManaKeyValueEntries(manaDetails: OutputManaDetails | null, manaInfo: BaseTokenResponse): IKeyValueEntries {
    const showDecayMana = manaDetails?.storedMana && manaDetails?.storedManaDecayed;
    const decay = showDecayMana ? Number(manaDetails?.storedMana ?? 0) - Number(manaDetails?.storedManaDecayed ?? 0) : undefined;
    const renderStoredMana = (mana?: string | number | null): React.ReactNode => {
        const [isFormatFull, setIsFormatFull] = React.useState(false);
        return (
            <span className="balance-base-token pointer margin-r-5" onClick={() => setIsFormatFull(!isFormatFull)}>
                {formatAmount(mana ?? "0", manaInfo, isFormatFull)}
            </span>
        );
    };

    return {
        label: "Mana:",
        value: manaDetails?.totalMana,
        entries: [
            {
                label: "Stored:",
                value: renderStoredMana(manaDetails?.storedMana),
            },
            {
                label: "Decay:",
                value: renderStoredMana(String(decay)),
            },
            {
                label: "Potential:",
                value: renderStoredMana(manaDetails?.potentialMana),
            },
            {
                label: "Mana Rewards:",
                value: renderStoredMana(manaDetails?.manaRewards),
            },
        ],
    };
}