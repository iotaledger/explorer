import { SignedTransactionPayload as ISignedTransactionPayload, Utils } from "@iota/sdk-wasm-nova/web";
import React from "react";
import Modal from "~/app/components/Modal";
import Unlocks from "~/app/components/nova/Unlocks";
import OutputView from "~/app/components/nova/OutputView";
import { useNetworkInfoNova } from "~helpers/nova/networkInfo";
import transactionPayloadMessage from "~assets/modals/stardust/block/transaction-payload.json";
import { IInput } from "~/models/api/nova/IInput";
import Input from "~/app/components/nova/Input";

interface SignedTransactionPayloadProps {
    readonly payload: ISignedTransactionPayload;
    readonly inputs: IInput[];
    readonly header?: string;
}

const SignedTransactionPayload: React.FC<SignedTransactionPayloadProps> = ({ payload, inputs, header }) => {
    const { outputs } = payload.transaction;
    const { name: network } = useNetworkInfoNova((s) => s.networkInfo);
    const transactionId = Utils.transactionId(payload);

    return (
        <div className="transaction-payload">
            {header && (
                <div className="section--header">
                    <div className="row middle">
                        <h2>{header}</h2>
                        <Modal icon="info" data={transactionPayloadMessage} />
                    </div>
                </div>
            )}
            <div className="row row--tablet-responsive fill">
                <div className="card col fill">
                    <div className="card--header">
                        <h2 className="card--header__title">From</h2>
                        <span className="dot-separator">•</span>
                        <span>{inputs.length}</span>
                    </div>
                    <div className="transaction-payload_outputs card--content">
                        {inputs.map((input, idx) => (
                            <Input key={idx} network={network} input={input} />
                        ))}
                        <Unlocks unlocks={payload.unlocks} />
                    </div>
                </div>

                <div className="card col fill">
                    <div className="card--header">
                        <h2 className="card--header__title">To</h2>
                        <span className="dot-separator">•</span>
                        <span>{outputs.length}</span>
                    </div>
                    <div className="transaction-payload_outputs card--content">
                        {outputs.map((output, idx) => (
                            <OutputView
                                key={idx}
                                outputId={Utils.computeOutputId(transactionId, idx)}
                                output={output}
                                showCopyAmount={true}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

SignedTransactionPayload.defaultProps = {
    payload: undefined,
    inputs: undefined,
    header: undefined,
};

export default SignedTransactionPayload;
