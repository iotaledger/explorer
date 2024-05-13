import { SignedTransactionPayload as ISignedTransactionPayload, Utils } from "@iota/sdk-wasm-nova/web";
import React, { useEffect, useState } from "react";
import Modal from "~/app/components/Modal";
import Input from "~/app/components/nova/Input";
import OutputView from "~/app/components/nova/OutputView";
import Unlocks from "~/app/components/nova/Unlocks";
import { IInput } from "~/models/api/nova/IInput";
import transactionPayloadMessage from "~assets/modals/nova/block/transaction-payload.json";
import { useNetworkInfoNova } from "~helpers/nova/networkInfo";
import { getInputsPreExpandedConfig, getOutputsPreExpandedConfig } from "~helpers/nova/preExpandedConfig";
import { IPreExpandedConfig } from "~models/components";

interface SignedTransactionPayloadProps {
    readonly payload: ISignedTransactionPayload;
    readonly inputs: IInput[];
    readonly header?: string;
}

const SignedTransactionPayload: React.FC<SignedTransactionPayloadProps> = ({ payload, inputs, header }) => {
    const { outputs } = payload.transaction;
    const { bech32Hrp, name: network } = useNetworkInfoNova((s) => s.networkInfo);
    const [inputsPreExpandedConfig, setInputsPreExpandedConfig] = useState<IPreExpandedConfig[]>([]);

    const transactionId = Utils.transactionId(payload);

    const outputsPreExpandedConfig = getOutputsPreExpandedConfig(outputs);

    useEffect(() => {
        if (bech32Hrp) {
            const inputsPreExpandedConfig = getInputsPreExpandedConfig(inputs, payload.unlocks, bech32Hrp);
            setInputsPreExpandedConfig(inputsPreExpandedConfig);
        }
    }, [bech32Hrp]);

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
                            <Input key={idx} network={network} input={input} preExpandedConfig={inputsPreExpandedConfig[idx]} />
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
                                preExpandedConfig={outputsPreExpandedConfig[idx]}
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
