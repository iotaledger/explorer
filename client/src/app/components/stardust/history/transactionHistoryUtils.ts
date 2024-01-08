import { CommonOutput, ExpirationUnlockCondition, INodeInfoBaseToken, OutputResponse, UnlockConditionType } from "@iota/sdk-wasm/web";
import moment from "moment/moment";

import { DateHelper } from "~helpers/dateHelper";
import { OutputWithDetails } from "~helpers/hooks/useAddressHistory";
import { TransactionsHelper } from "~helpers/stardust/transactionsHelper";
import { formatAmount } from "~helpers/stardust/valueFormatHelper";
import { CHRYSALIS_MAINNET } from "~models/config/networkType";

export interface ITransactionHistoryRecord {
    isGenesisByDate: boolean;
    isTransactionFromStardustGenesis: boolean;
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

        const transactionId = output.isSpent
            ? detailsMetadata.transactionIdSpent
            : detailsMetadata.transactionId;

        if (!transactionId) {
            return;
        }

        const addOutput = (transactionId: string, output: OutputWithDetails) => {
            // if we don't have the transaction
            const previousOutputs = transactionIdToOutputs.get(transactionId);
            if (previousOutputs) {
                transactionIdToOutputs.set(transactionId, [...previousOutputs, output]);
            } else {
                transactionIdToOutputs.set(transactionId, [output]);
            }
        };
        // addOutput(transactionId, output);

        addOutput(detailsMetadata.transactionIdSpent as string, output);
        addOutput(detailsMetadata.transactionId, output);

    });

    return transactionIdToOutputs;
}

export const getTransactionHistoryRecords = (
    transactionIdToOutputs: Map<string, OutputWithDetails[]>,
    network: string,
    tokenInfo: INodeInfoBaseToken,
    isFormattedAmounts: boolean
): ITransactionHistoryRecord[] => {
    const calculatedTransactions: ITransactionHistoryRecord[] = [];

    transactionIdToOutputs.forEach((outputs, transactionId) => {
        const lastOutputTime = Math.max(...outputs.map((t) => t.milestoneTimestamp));
        const balanceChange = calculateBalanceChange(outputs);
        const ago = moment(lastOutputTime * 1000).fromNow();

        const isGenesisByDate = outputs
            .map((t) => t.milestoneTimestamp)
            .some((milestoneTimestamp) => milestoneTimestamp === 0);

        const milestoneIndexes = outputs.map((t) => t.milestoneIndex);
        const isTransactionFromStardustGenesis = milestoneIndexes
            .some(milestoneIndex => TransactionsHelper.isTransactionFromIotaStardustGenesis(network, milestoneIndex));

        const transactionLink = isTransactionFromStardustGenesis ?
            `/${CHRYSALIS_MAINNET}/search/${transactionId}` :
            `/${network}/transaction/${transactionId}`;

        const isSpent = balanceChange < 0;

        calculatedTransactions.push({
            isGenesisByDate: isGenesisByDate,
            isTransactionFromStardustGenesis: isTransactionFromStardustGenesis,
            isSpent: isSpent,
            transactionLink: transactionLink,
            transactionId: transactionId,
            timestamp: lastOutputTime,
            dateFormatted: `${DateHelper.formatShort(lastOutputTime * 1000)} (${ago})`,
            balanceChange: balanceChange,
            balanceChangeFormatted: (isSpent ? `-` : `+`) + formatAmount(Math.abs(balanceChange), tokenInfo, !isFormattedAmounts),
            outputs: outputs
        });
    })
    return calculatedTransactions;
}

export const calculateBalanceChange = (outputs: OutputWithDetails[]) => {
    return outputs.reduce((acc, output) => {
        const neededIds = [
            "0x135f00374f4fe01f3d52e4becd8a01d736412d42fae3eb10f7f866ffa328d0cc0100",
            "0x135f00374f4fe01f3d52e4becd8a01d736412d42fae3eb10f7f866ffa328d0cc",

            "0x135f00374f4fe01f3d52e4becd8a01d736412d42fae3eb10f7f866ffa328d0cc0000",
            "0x135f00374f4fe01f3d52e4becd8a01d736412d42fae3eb10f7f866ffa328d0cc",

            "0xa12ce8220fee69e9396c0438c8f1530b3fead27d619d53e1dde59930b09505a10100",
            "0xa12ce8220fee69e9396c0438c8f1530b3fead27d619d53e1dde59930b09505a1",

            "0xa12ce8220fee69e9396c0438c8f1530b3fead27d619d53e1dde59930b09505a10000",
            "0xa12ce8220fee69e9396c0438c8f1530b3fead27d619d53e1dde59930b09505a1",
        ];

        if (neededIds.includes(output.outputId)) {
            console.log("Found output: ", output);
        }


        const outputFromDetails = output?.details?.output as CommonOutput;

        if (!outputFromDetails?.amount) {
            console.warn("Output details not found for: ", output);
            return acc;
        }

        let amount = Number(outputFromDetails.amount);
        if (output.isSpent) {
            amount = -1 * amount;
            // we need to cover the case where the output is spent not by the current address,
            // but by the return address of an expired expiration unlock condition
            const expirationUnlockCondition = outputFromDetails.unlockConditions?.find(({ type }) => type === UnlockConditionType.Expiration) as ExpirationUnlockCondition;

            if (expirationUnlockCondition && output.milestoneTimestamp > expirationUnlockCondition.unixTime) {
                amount = 0;
            }
        }
        return acc + amount;
    }, 0);
};
