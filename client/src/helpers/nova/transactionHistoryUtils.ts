import { CommonOutput, BaseTokenResponse } from "@iota/sdk-wasm-nova/web";
import moment from "moment/moment";

import { DateHelper } from "~helpers/dateHelper";
import { OutputWithDetails } from "~helpers/nova/hooks/useAddressHistory";
import { formatAmount } from "~helpers/stardust/valueFormatHelper";

export interface ITransactionHistoryRecord {
    isSpent: boolean;
    transactionLink: string;
    transactionId: string;
    timestamp: number;
    dateFormatted: string;
    balanceChange: number;
    balanceChangeFormatted: string;
    outputs: OutputWithDetails[];
}

export const groupOutputsByTransactionId = (outputsWithDetails: OutputWithDetails[]) => {
    const transactionIdToOutputs = new Map<string, OutputWithDetails[]>();
    outputsWithDetails.forEach((output) => {
        const detailsMetadata = output?.details?.metadata;
        if (!detailsMetadata) {
            return;
        }

        const transactionId = output.isSpent ? detailsMetadata.spent?.transactionId : detailsMetadata.included?.transactionId;

        if (!transactionId) {
            return;
        }

        const addOutputToTransactionId = (transactionId: string, output: OutputWithDetails) => {
            // if we don't have the transaction
            const previousOutputs = transactionIdToOutputs.get(transactionId);
            if (previousOutputs) {
                transactionIdToOutputs.set(transactionId, [...previousOutputs, output]);
            } else {
                transactionIdToOutputs.set(transactionId, [output]);
            }
        };
        addOutputToTransactionId(transactionId, output);
    });

    return transactionIdToOutputs;
};

export const getTransactionHistoryRecords = (
    transactionIdToOutputs: Map<string, OutputWithDetails[]>,
    network: string,
    tokenInfo: BaseTokenResponse,
    isFormattedAmounts: boolean,
    slotIndexToUnixTimeRange: (slotIndex: number) => { from: number; to: number },
): ITransactionHistoryRecord[] => {
    const calculatedTransactions: ITransactionHistoryRecord[] = [];

    transactionIdToOutputs.forEach((outputs, transactionId) => {
        const lastOutputTime = Math.max(
            ...outputs.map((t) => {
                const slotIncluded = t.slotIndex;
                const slotRange = slotIndexToUnixTimeRange(slotIncluded);
                return slotRange.to - 1;
            }),
        );
        const balanceChange = calculateBalanceChange(outputs);
        const ago = moment(lastOutputTime * 1000).fromNow();

        const transactionLink = getTransactionLink(network, transactionId);

        const isSpent = balanceChange <= 0;

        calculatedTransactions.push({
            isSpent: isSpent,
            transactionLink: transactionLink,
            transactionId: transactionId,
            timestamp: lastOutputTime,
            dateFormatted: `${DateHelper.formatShort(lastOutputTime * 1000)} (${ago})`,
            balanceChange: balanceChange,
            balanceChangeFormatted: (isSpent ? `-` : `+`) + formatAmount(Math.abs(balanceChange), tokenInfo, !isFormattedAmounts, 2, true),
            outputs: outputs,
        });
    });
    return calculatedTransactions;
};

export const calculateBalanceChange = (outputs: OutputWithDetails[]) => {
    return outputs.reduce((acc, output) => {
        const outputFromDetails = output?.details?.output as CommonOutput;

        if (!outputFromDetails?.amount) {
            console.warn("Output details not found for: ", output);
            return acc;
        }

        let amount = Number(outputFromDetails.amount);
        if (output.isSpent) {
            amount = -1 * amount;
        }
        return acc + amount;
    }, 0);
};

export const getTransactionLink = (network: string, transactionId: string) => {
    return `/${network}/transaction/${transactionId}`;
};
