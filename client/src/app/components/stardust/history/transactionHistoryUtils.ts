import { INodeInfoBaseToken, OutputResponse } from "@iota/sdk-wasm/web";
import moment from "moment/moment";

import { ITransactionHistoryItem } from "~models/api/stardust/ITransactionHistoryResponse";
import { IOutputDetailsMap } from "~helpers/hooks/useAddressHistory";
import { TransactionsHelper } from "~helpers/stardust/transactionsHelper";
import { CHRYSALIS_MAINNET } from "~models/config/networkType";
import { DateHelper } from "~helpers/dateHelper";
import { formatAmount } from "~helpers/stardust/valueFormatHelper";
import { calculateBalanceChange, ITransactionHistoryRecord } from "~app/components/stardust/history/TransactionHistory";

export const groupOutputsByTransactionId = (historyView: ITransactionHistoryItem[], outputDetailsMap: IOutputDetailsMap) => {
    const byTransactionId = new Map<string, (OutputResponse & ITransactionHistoryItem)[]>();
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

        if (!byTransactionId.has(transactionId)) {
            byTransactionId.set(transactionId, []);
        }

        const transaction = byTransactionId.get(transactionId);
        transaction?.push({...historyItem, ...outputDetails});
    });
    return byTransactionId;
}

export const getTransactionHistoryRecords = (
    transactionIdToOutputs: Map<string, (OutputResponse & ITransactionHistoryItem)[]>,
    network: string,
    tokenInfo: INodeInfoBaseToken,
    isFormattedAmounts: boolean
) => {
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
