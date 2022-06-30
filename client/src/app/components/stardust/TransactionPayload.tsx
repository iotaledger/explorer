import React, { ReactNode } from "react";
import transactionPayloadMessage from "../../../assets/modals/message/transaction-payload.json";
import { formatAmount } from "../../../helpers/stardust/valueFormatHelper";
import NetworkContext from "../../context/NetworkContext";
import AsyncComponent from "../AsyncComponent";
import FiatValue from "../FiatValue";
import Modal from "../Modal";
import "./TransactionPayload.scss";
import Input from "./Input";
import Output from "./Output";
import { TransactionPayloadProps } from "./TransactionPayloadProps";
import { TransactionPayloadState } from "./TransactionPayloadState";

/**
 * Component which will display a transaction payload.
 */
class TransactionPayload extends AsyncComponent<TransactionPayloadProps, TransactionPayloadState> {
    /**
     * The component context type.
     */
    public static contextType = NetworkContext;

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
        const { network, inputs, outputs, transferTotal, history } = this.props;

        return (
            <div className="transaction-payload">
                <div className="section--header">
                    <div className="row middle">
                        <h2>
                            Transaction Payload
                        </h2>
                        <Modal icon="info" data={transactionPayloadMessage} />
                    </div>
                    <div className="transaction-value">
                        <div>
                            <span
                                onClick={() => this.setState({
                                    isFormattedBalance: !this.state.isFormattedBalance
                                })}
                                className="value pointer"
                            >
                                {formatAmount(transferTotal, this.context.tokenInfo, !this.state.isFormattedBalance)}
                            </span>
                            <span className="dot-separator">•</span>
                            <span className="fiat-value">
                                <FiatValue value={transferTotal} />
                            </span>
                        </div>
                    </div>
                </div>
                <div className="row row--tablet-responsive fill">
                    <div className="card col fill">
                        <div className="card--header">
                            <h2 className="card--header__title">From</h2>
                            <span className="dot-separator">•</span>
                            <span>{inputs.length}</span>
                        </div>
                        <div className="card--content">
                            {inputs.map((input, idx) => (
                                <Input key={idx} input={input} network={network} history={history} />
                            ))}
                        </div>
                    </div>

                    <div className="card col fill">
                        <div className="card--header">
                            <h2 className="card--header__title">To</h2>
                            <span className="dot-separator">•</span>
                            <span>{outputs.length}</span>
                        </div>
                        {outputs.map((output, idx) => (
                            <Output
                                key={idx}
                                outputId={output.id}
                                output={output.output}
                                amount={output.amount}
                                network={network}
                                showCopyAmount={true}
                            />
                        ))}
                    </div>
                </div>
            </div>
        );
    }
}

export default TransactionPayload;

