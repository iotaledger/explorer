import {
    Block, PayloadType, Unlock, TransactionPayload as ITransactionPayload,
    MilestonePayload as IMilestonePayload, RegularTransactionEssence, TaggedDataPayload as ITaggedDataPayload
} from "@iota/iota.js-stardust/web";
import * as H from "history";
import React from "react";
import { IInput } from "../../../../../models/api/stardust/IInput";
import { IOutput } from "../../../../../models/api/stardust/IOutput";
import MilestonePayload from "../payload/milestone/MilestonePayload";
import TaggedDataPayload from "../payload/TaggedDataPayload";
import TransactionPayload from "../payload/TransactionPayload";

interface BlockPayloadSectionProps {
    network: string;
    protocolVersion: number;
    block: Block;
    inputs?: IInput[];
    unlocks?: Unlock[];
    outputs?: IOutput[];
    transferTotal?: number;
    history: H.History;
    isLinksDisabled: boolean;
}

const BlockPayloadSection: React.FC<BlockPayloadSectionProps> = (
    { network, protocolVersion, block, inputs, outputs, unlocks, transferTotal, history, isLinksDisabled }
) => {
    if (
        block.payload?.type === PayloadType.Transaction &&
        inputs && unlocks && outputs && transferTotal !== undefined
    ) {
        const transactionPayload = block.payload as ITransactionPayload;
        const transactionEssence = transactionPayload.essence as RegularTransactionEssence;

        return (
            <React.Fragment>
                <div className="section">
                    <TransactionPayload
                        network={network}
                        inputs={inputs}
                        unlocks={unlocks}
                        outputs={outputs}
                        isLinksDisabled={isLinksDisabled}
                    />
                </div>
                {
                    transactionEssence.payload?.type === PayloadType.TaggedData &&
                    <div className="section">
                        <TaggedDataPayload
                            network={network}
                            history={history}
                            payload={transactionEssence.payload as ITaggedDataPayload}
                        />
                    </div>
                }
            </React.Fragment>
        );
    } else if (
        block.payload?.type === PayloadType.Milestone
    ) {
        return (
            <MilestonePayload
                network={network}
                history={history}
                milestonePayload={block.payload as IMilestonePayload}
                protocolVersion={protocolVersion}
            />
        );
    } else if (
        block.payload?.type === PayloadType.TaggedData
    ) {
        return (
            <div className="section">
                <TaggedDataPayload
                    network={network}
                    history={history}
                    payload={block.payload as ITaggedDataPayload}
                />
            </div>
        );
    }

    return null;
};

BlockPayloadSection.defaultProps = {
    inputs: undefined,
    outputs: undefined,
    transferTotal: undefined,
    unlocks: undefined
};

export default BlockPayloadSection;

