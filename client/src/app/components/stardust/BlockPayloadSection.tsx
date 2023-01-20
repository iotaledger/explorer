import {
    IBlock, ISignatureUnlock, IUTXOInput, MILESTONE_PAYLOAD_TYPE,
    TAGGED_DATA_PAYLOAD_TYPE, TRANSACTION_PAYLOAD_TYPE
} from "@iota/iota.js-stardust";
import * as H from "history";
import React from "react";
import { IInput } from "../../../models/api/stardust/IInput";
import { IOutput } from "../../../models/api/stardust/IOutput";
import MilestonePayload from "./MilestonePayload";
import TaggedDataPayload from "./TaggedDataPayload";
import TransactionPayload from "./TransactionPayload";

interface BlockPayloadSectionProps {
    network: string;
    protocolVersion: number;
    block: IBlock;
    inputs?: (IUTXOInput & IInput)[];
    unlocks?: ISignatureUnlock[];
    outputs?: IOutput[];
    transferTotal?: number;
    history: H.History;
    isLinksDisabled: boolean;
}

const BlockPayloadSection: React.FC<BlockPayloadSectionProps> = (
    { network, protocolVersion, block, inputs, outputs, unlocks, transferTotal, history, isLinksDisabled }
) => (
    <React.Fragment>
        {block.payload?.type === TRANSACTION_PAYLOAD_TYPE &&
            inputs && unlocks && outputs && transferTotal !== undefined && (
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
                        block.payload.essence.payload &&
                        <div className="section">
                            <TaggedDataPayload
                                network={network}
                                history={history}
                                payload={block.payload.essence.payload}
                            />
                        </div>
                    }
                </React.Fragment>
            )}
        {block.payload?.type === MILESTONE_PAYLOAD_TYPE && (
            <MilestonePayload
                network={network}
                history={history}
                milestonePayload={block.payload}
                protocolVersion={protocolVersion}
            />
        )}
        {block.payload?.type === TAGGED_DATA_PAYLOAD_TYPE && (
            <div className="section">
                <TaggedDataPayload
                    network={network}
                    history={history}
                    payload={block.payload}
                />
            </div>
        )}
    </React.Fragment>
);

BlockPayloadSection.defaultProps = {
    inputs: undefined,
    outputs: undefined,
    transferTotal: undefined,
    unlocks: undefined
};

export default BlockPayloadSection;

