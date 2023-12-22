import { CommonOutput, ExpirationUnlockCondition, INodeInfoBaseToken, OutputResponse, UnlockConditionType } from "@iota/sdk-wasm/web";
import moment from "moment/moment";

import { DateHelper } from "~helpers/dateHelper";
import { IOutputDetailsMap } from "~helpers/hooks/useAddressHistory";
import { TransactionsHelper } from "~helpers/stardust/transactionsHelper";
import { formatAmount } from "~helpers/stardust/valueFormatHelper";
import { ITransactionHistoryItem } from "~models/api/stardust/ITransactionHistoryResponse";
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
    outputs: (OutputResponse & ITransactionHistoryItem)[];
}

export const groupOutputsByTransactionId = (historyView: ITransactionHistoryItem[], outputDetailsMap: IOutputDetailsMap) => {
    const transactionIdToOutputs = new Map<string, (OutputResponse & ITransactionHistoryItem)[]>();
    historyView.forEach((historyItem) => {
        const outputDetails = outputDetailsMap[historyItem.outputId];
        if (!outputDetails) {
            return;
        }
        const transactionId = historyItem.isSpent ?
            outputDetails.metadata.transactionIdSpent :
            outputDetails.metadata.transactionId;

        if (!transactionId) {
            return;
        }

        if (!transactionIdToOutputs.has(transactionId)) {
            transactionIdToOutputs.set(transactionId, []);
        }

        const transaction = transactionIdToOutputs.get(transactionId);
        transaction?.push({ ...historyItem, ...outputDetails });
    });
    return transactionIdToOutputs;
}

export const getTransactionHistoryRecords = (
    transactionIdToOutputs: Map<string, (OutputResponse & ITransactionHistoryItem)[]>,
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

export const calculateBalanceChange = (outputs: (OutputResponse & ITransactionHistoryItem)[]) => {
    return outputs.reduce((acc, output) => {
        let amount = Number(output.output.amount);
        if (output.isSpent) {
            const commonOutput = (output.output as CommonOutput);
            amount = -1 * amount;
            // we need to cover the case where the output is spent not by the current address, 
            // but by the return address of an expired expiration unlock condition
            const expirationUnlockCondition = commonOutput.unlockConditions?.find(({ type }) => type === UnlockConditionType.Expiration) as ExpirationUnlockCondition;
            if (expirationUnlockCondition && output.milestoneTimestamp > expirationUnlockCondition.unixTime) {
                amount = 0;
            }
        }
        return acc + amount;
    }, 0);
};
