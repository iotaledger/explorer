import {
    AccountAddress,
    BlockIssuanceCreditContextInput,
    CommitmentContextInput,
    ContextInput,
    ContextInputType,
    RewardContextInput,
    Utils,
} from "@iota/sdk-wasm-nova/web";
import React from "react";
import TruncatedId from "../stardust/TruncatedId";
import { useNetworkInfoNova } from "~/helpers/nova/networkInfo";

interface IContextInputViewProps {
    readonly contextInput: ContextInput;
}

const ContextInputView: React.FC<IContextInputViewProps> = ({ contextInput }) => {
    const { name: network, bech32Hrp } = useNetworkInfoNova((s) => s.networkInfo);
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
        const accountAddress = new AccountAddress(input.accountId);
        const bech32Address = Utils.addressToBech32(accountAddress, bech32Hrp);

        return (
            <div className="section--data">
                <div className="label">Account</div>
                <div className="value code highlight">
                    <TruncatedId id={bech32Address} link={`/${network}/addr/${bech32Address}`} showCopyButton />
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

    return null;
};

export default ContextInputView;
