import {
    Block,
    PayloadType,
    SignedTransactionPayload as ISignedTransactionPayload,
    TaggedDataPayload as ITaggedDataPayload,
    BasicBlockBody,
    Utils,
} from "@iota/sdk-wasm-nova/web";
import React from "react";
import { IInput } from "~models/api/nova/IInput";
import { IOutput } from "~models/api/nova/IOutput";
import TaggedDataPayload from "../payload/TaggedDataPayload";
import SignedTransactionPayload from "../payload/SignedTransactionPayload";
import TruncatedId from "~/app/components/stardust/TruncatedId";
import { useNetworkInfoNova } from "~/helpers/nova/networkInfo";

interface BlockPayloadSectionProps {
    readonly block: Block;
    readonly inputs?: IInput[];
    readonly outputs?: IOutput[];
    readonly transferTotal?: number;
}

const BlockPayloadSection: React.FC<BlockPayloadSectionProps> = ({ block, inputs, outputs, transferTotal }) => {
    const { networkInfo } = useNetworkInfoNova();
    const payload = (block.body as BasicBlockBody).payload;

    if (payload?.type === PayloadType.SignedTransaction && inputs && outputs && transferTotal !== undefined) {
        const transactionPayload = payload as ISignedTransactionPayload;
        const transaction = transactionPayload.transaction;
        const nestedTransactionId =
            transaction.payload?.type === PayloadType.SignedTransaction
                ? Utils.transactionId(transaction.payload as ISignedTransactionPayload)
                : undefined;

        return (
            <React.Fragment>
                <div className="section">
                    <SignedTransactionPayload inputs={inputs} payload={transactionPayload} />
                </div>
                {transaction.payload?.type === PayloadType.TaggedData && (
                    <div className="section">
                        <TaggedDataPayload payload={transaction.payload as ITaggedDataPayload} />
                    </div>
                )}
                {nestedTransactionId && (
                    <div className="section">
                        <div className="section--data">
                            <div className="label">Transaction</div>
                            <div className="value code">
                                <TruncatedId id={nestedTransactionId} link={`/${networkInfo.name}/transaction/${nestedTransactionId}`} />
                            </div>
                        </div>
                    </div>
                )}
            </React.Fragment>
        );
    } else if (payload?.type === PayloadType.CandidacyAnnouncement) {
        return (
            <div>
                {/* todo */}
                CandidacyAnnouncement
            </div>
        );
    } else if (payload?.type === PayloadType.TaggedData) {
        return (
            <div className="section">
                <TaggedDataPayload payload={payload as ITaggedDataPayload} />
            </div>
        );
    }

    return null;
};

BlockPayloadSection.defaultProps = {
    inputs: undefined,
    outputs: undefined,
    transferTotal: undefined,
};

export default BlockPayloadSection;
