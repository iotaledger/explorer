import {OutputResponse} from "@iota/sdk-wasm/web";
import {ITransactionHistoryItem} from "~models/api/stardust/ITransactionHistoryResponse";
import {IOutputDetailsMap} from "~helpers/hooks/useAddressHistory";

export const calculateBalanceChange = (outputs: (OutputResponse & ITransactionHistoryItem)[]) => {
    return outputs.reduce((acc, output) => {
        if (output.isSpent) {
            return acc - Number(output.output.amount);
        }
        return acc + Number(output.output.amount);
    }, 0);
};

export const mapByTransactionId = (historyView: ITransactionHistoryItem[], outputDetailsMap: IOutputDetailsMap) => {
    const byTransactionId: { [key: string]: (OutputResponse & ITransactionHistoryItem)[] } = {};
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

        if (!byTransactionId[transactionId]) {
            byTransactionId[transactionId] = [];
        }

        byTransactionId[transactionId].push({...historyItem, ...outputDetails});
    });
    return byTransactionId;

}
