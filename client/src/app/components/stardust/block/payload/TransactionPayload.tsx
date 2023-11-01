import React, { ReactNode } from "react";
import { TransactionPayloadProps } from "./TransactionPayloadProps";
import { TransactionPayloadState } from "./TransactionPayloadState";
import transactionPayloadMessage from "../../../../../assets/modals/stardust/block/transaction-payload.json";
import NetworkContext from "../../../../context/NetworkContext";
import AsyncComponent from "../../../AsyncComponent";
import Modal from "../../../Modal";
import Input from "../../Input";
import Output from "../../Output";
import Unlocks from "../../Unlocks";
import "./TransactionPayload.scss";

/**
 * Component which will display a transaction payload.
 */
class TransactionPayload extends AsyncComponent<TransactionPayloadProps, TransactionPayloadState> {
    /**
     * The component context type.
     */
    public static contextType = NetworkContext;

    /**
     * The component context.
     */
    public declare context: React.ContextType<typeof NetworkContext>;

    /**
     * Create a new instance of TransactionPayload.
     * @param props The props.
     */
    constructor(props: TransactionPayloadProps) {
        super(props);

        this.state = {
            isFormattedBalance: true
        };
    }

    /**
     * The component mounted.
     */
    public async componentDidMount(): Promise<void> {
        super.componentDidMount();
    }

    /**
     * Render the component.
     * @returns The node to render.
     */
    public render(): ReactNode {
        const { network, inputs, unlocks, outputs, header, isLinksDisabled } = this.props;

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
                            {inputs.map((input, idx) => <Input key={idx} network={network} input={input} />)}
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
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default TransactionPayload;

