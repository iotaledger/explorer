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
        totalMana += BigInt(manaRewards);
    }

    return {
        storedMana: (output as BasicOutput).mana?.toString(),
        storedManaDecayed,
        potentialMana,
        manaRewards: manaRewards?.toString() ?? undefined,
        totalMana: totalMana.toString(),
    };
}

export function getManaKeyValueEntries(
    manaDetails: OutputManaDetails | null,
    manaInfo: BaseTokenResponse,
    showManaRewards: boolean = false,
): IKeyValueEntries {
    const showDecayMana = manaDetails?.storedMana && manaDetails?.storedManaDecayed;
    const decay = showDecayMana ? Number(manaDetails?.storedMana ?? 0) - Number(manaDetails?.storedManaDecayed ?? 0) : undefined;

    const renderMana = (mana?: string | number | null): React.ReactNode => {
        const [isFormatFull, setIsFormatFull] = React.useState(false);
        return (
            <span
                className="balance-base-token pointer margin-r-5"
                onClick={(e) => {
                    setIsFormatFull(!isFormatFull);
                    e.stopPropagation();
                }}
            >
                {formatAmount(mana ?? 0, manaInfo, isFormatFull)}
            </span>
        );
    };

    const entries = {
        label: "Mana:",
        value: renderMana(manaDetails?.totalMana),
        entries: [
            {
                label: "Stored:",
                value: renderMana(manaDetails?.storedMana),
            },
            {
                label: "Decay:",
                value: renderMana(decay),
            },
            {
                label: "Potential:",
                value: renderMana(manaDetails?.potentialMana),
            },
        ],
    };

    if (showManaRewards) {
        entries.entries.push({
            label: "Mana Rewards:",
            value: renderMana(manaDetails?.manaRewards),
        });
    }

    return entries;
}
