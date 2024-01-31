import React, { useContext, useEffect, useState } from "react";
import NetworkContext from "~/app/context/NetworkContext";
import transactionPayloadMessage from "~assets/modals/stardust/block/transaction-payload.json";
import { getInputsPreExpandedConfig, getOutputsPreExpandedConfig } from "~helpers/stardust/preExpandedConfig";
import { IPreExpandedConfig } from "~models/components";
import Modal from "../../../Modal";
import Input from "../../Input";
import Output from "../../Output";
import Unlocks from "../../Unlocks";
import "./TransactionPayload.scss";
import { TransactionPayloadProps } from "./TransactionPayloadProps";

/**
 * Component which will display a transaction payload.
 */
const TransactionPayload: React.FC<TransactionPayloadProps> = ({ network, inputs, unlocks, outputs, header, isLinksDisabled }) => {
    const [inputsPreExpandedConfig, setInputsPreExpandedConfig] = useState<IPreExpandedConfig[]>([]);
    const { bech32Hrp } = useContext(NetworkContext);

    const outputsPreExpandedConfig = getOutputsPreExpandedConfig(outputs);

    useEffect(() => {
        if (bech32Hrp) {
            const inputsPreExpandedConfig = getInputsPreExpandedConfig(inputs, unlocks, bech32Hrp);
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
                        <Unlocks unlocks={unlocks} />
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
                            <Output
                                key={idx}
                                outputId={output.id}
                                output={output.output}
                                amount={output.amount}
                                network={network}
                                showCopyAmount={true}
                                isLinksDisabled={isLinksDisabled}
                                preExpandedConfig={outputsPreExpandedConfig[idx]}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TransactionPayload;
