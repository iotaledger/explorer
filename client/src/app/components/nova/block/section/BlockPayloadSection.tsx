import {
    Block,
    PayloadType,
    SignedTransactionPayload as ISignedTransactionPayload,
    TaggedDataPayload as ITaggedDataPayload,
    BasicBlockBody,
} from "@iota/sdk-wasm-nova/web";
import React from "react";
import { IInput } from "~models/api/nova/IInput";
import { IOutput } from "~models/api/nova/IOutput";
import TaggedDataPayload from "../payload/TaggedDataPayload";
import SignedTransactionPayload from "../payload/SignedTransactionPayload";

interface BlockPayloadSectionProps {
    readonly block: Block;
    readonly inputs?: IInput[];
    readonly outputs?: IOutput[];
    readonly transferTotal?: number;
}

const BlockPayloadSection: React.FC<BlockPayloadSectionProps> = ({ block, inputs, transferTotal }) => {
    const payload = (block.body as BasicBlockBody).payload;

    if (payload?.type === PayloadType.SignedTransaction && inputs && transferTotal !== undefined) {
        const transactionPayload = payload as ISignedTransactionPayload;
        const transaction = transactionPayload.transaction;

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
            </React.Fragment>
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
    transferTotal: undefined,
};

export default BlockPayloadSection;
