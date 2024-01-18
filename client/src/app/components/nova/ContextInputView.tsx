import {
    BlockIssuanceCreditContextInput,
    CommitmentContextInput,
    ContextInput,
    ContextInputType,
    RewardContextInput,
} from "@iota/sdk-wasm-nova/web";
import React from "react";
import TruncatedId from "../stardust/TruncatedId";
import { useNetworkInfoNova } from "~/helpers/nova/networkInfo";

interface IContextInputViewProps {
    readonly contextInput: ContextInput;
}

const ContextInputView: React.FC<IContextInputViewProps> = ({ contextInput }) => {
    const { networkInfo } = useNetworkInfoNova();
    if (contextInput.type === ContextInputType.COMMITMENT) {
        const input = contextInput as CommitmentContextInput;

        return (
            <div className="section--data">
                <div className="label">Commitment id</div>
                <div className="value code">{input.commitmentId}</div>
            </div>
        );
    } else if (contextInput.type === ContextInputType.BLOCK_ISSUANCE_CREDIT) {
        const input = contextInput as BlockIssuanceCreditContextInput;

        return (
            <div className="section--data">
                <div className="label">Account</div>
                <div className="value code">
                    <TruncatedId id={input.accountId} link={`/${networkInfo.name}/account/${input.accountId}`} showCopyButton />
                </div>
            </div>
        );
    } else if (contextInput.type === ContextInputType.REWARD) {
        const input = contextInput as RewardContextInput;

        return (
            <div className="section--data">
                <div className="label">Reward Input Index</div>
                <div className="value code">{input.index}</div>
            </div>
        );
    }
};

export default ContextInputView;
