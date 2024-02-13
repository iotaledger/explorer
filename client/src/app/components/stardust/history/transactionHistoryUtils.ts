import { CommonOutput, INodeInfoBaseToken } from "@iota/sdk-wasm/web";
import moment from "moment/moment";

import { DateHelper } from "~helpers/dateHelper";
import { OutputWithDetails } from "~helpers/hooks/useAddressHistory";
import { STARDUST_SUPPLY_INCREASE_TRANSACTION_ID, TransactionsHelper } from "~helpers/stardust/transactionsHelper";
import { formatAmount } from "~helpers/stardust/valueFormatHelper";
import { CHRYSALIS_MAINNET } from "~models/config/networkType";

export interface ITransactionHistoryRecord {
    isGenesisByDate: boolean;
    isTransactionFromStardustGenesis: boolean;
    isSpent: boolean;
    stardustGenesisOutputId?: string;
    stardustGenesisOutputLink?: string;
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

        const transactionId = output.isSpent ? detailsMetadata.transactionIdSpent : detailsMetadata.transactionId;

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
    tokenInfo: INodeInfoBaseToken,
    isFormattedAmounts: boolean,
): ITransactionHistoryRecord[] => {
    const calculatedTransactions: ITransactionHistoryRecord[] = [];

    let isSet = false; // TODO fake transaction. Remove after confirmation
    transactionIdToOutputs.forEach((outputs, transactionId, index) => {
        const lastOutputTime = Math.max(...outputs.map((t) => t.milestoneTimestamp));
        const balanceChange = calculateBalanceChange(outputs);
        const ago = moment(lastOutputTime * 1000).fromNow();

        const isGenesisByDate = outputs.map((t) => t.milestoneTimestamp).some((milestoneTimestamp) => milestoneTimestamp === 0);

        // TODO fake transaction. Remove after confirmation
        if (!isSet) {
            outputs[0].milestoneIndex = 7669900;
            isSet = true;
        }

        let stardustGenesisOutputId;
        let stardustGenesisOutputLink;
        const isTransactionFromStardustGenesis = outputs.some(({ milestoneIndex, outputId }) => {
            const isGenesis = TransactionsHelper.isTransactionFromIotaStardustGenesis(network, milestoneIndex);
            if (isGenesis) {
                stardustGenesisOutputId = outputId;
                stardustGenesisOutputLink = `/${network}/output/${outputId}`;
            }

            return isGenesis;
        });

        const transactionLink = getTransactionLink(network, transactionId, isTransactionFromStardustGenesis);

        const isSpent = balanceChange <= 0;

        calculatedTransactions.push({
            isGenesisByDate: isGenesisByDate,
            isTransactionFromStardustGenesis: isTransactionFromStardustGenesis,
            isSpent: isSpent,
            stardustGenesisOutputId: stardustGenesisOutputId,
            stardustGenesisOutputLink: stardustGenesisOutputLink,
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

export const getTransactionLink = (network: string, transactionId: string, isTransactionFromStardustGenesis: boolean) => {
    return isTransactionFromStardustGenesis && !transactionId.includes(STARDUST_SUPPLY_INCREASE_TRANSACTION_ID)
        ? `/${CHRYSALIS_MAINNET}/search/${transactionId}`
        : `/${network}/transaction/${transactionId}`;
};
