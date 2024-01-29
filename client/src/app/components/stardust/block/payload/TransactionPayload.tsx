import React, { ReactNode } from "react";
import { TransactionPayloadProps } from "./TransactionPayloadProps";
import { TransactionPayloadState } from "./TransactionPayloadState";
import transactionPayloadMessage from "~assets/modals/stardust/block/transaction-payload.json";
import NetworkContext from "../../../../context/NetworkContext";
import AsyncComponent from "../../../AsyncComponent";
import Modal from "../../../Modal";
import Input from "../../Input";
import Output from "../../Output";
import Unlocks from "../../Unlocks";
import "./TransactionPayload.scss";
import { AddressUnlockCondition, CommonOutput, ExpirationUnlockCondition, OutputType, UnlockConditionType } from "@iota/sdk-wasm/web";
import { IPreExpandedConfig } from "../../interfaces";

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
            isFormattedBalance: true,
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
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { network, inputs, unlocks, outputs, header, isLinksDisabled, milestoneIndex } = this.props;

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
                            {inputs.map((input, idx) => {
                                let preExpandedConfig: IPreExpandedConfig = {
                                    isPreExpanded: input?.output?.output?.type === OutputType.Basic,
                                };
                                if (input?.output?.output && 'unlockConditions' in input.output.output) {
                                    const commmonOutput = input.output.output as unknown as CommonOutput;
                                    preExpandedConfig = {
                                        ...preExpandedConfig,
                                        unlockConditions: commmonOutput.unlockConditions?.map(
                                            (unlockCondition) => unlockCondition.type === UnlockConditionType.Address)
                                    };

                                }
                                return (<Input key={idx} network={network} input={input} preExpandedConfig={preExpandedConfig} />)
                            })}
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
                            {outputs.map((output, idx) => {
                                let preExpandedConfig: IPreExpandedConfig = {
                                    isPreExpanded: output?.output?.type === OutputType.Basic,
                                };
                                if ('unlockConditions' in output.output) {
                                    const commmonOutput = output.output as CommonOutput;
                                    const expirationUnlockCondition: ExpirationUnlockCondition | undefined = (commmonOutput.unlockConditions?.find(unlockCondition => unlockCondition.type === UnlockConditionType.Expiration) as ExpirationUnlockCondition);
                                    const addressUnlockCondition: AddressUnlockCondition | undefined = (commmonOutput.unlockConditions?.find(unlockCondition => unlockCondition.type === UnlockConditionType.Address) as AddressUnlockCondition);

                                    const spentByAddress = addressUnlockCondition?.address
                                    if (expirationUnlockCondition) {
                                        // todo: check if the output was spent within the expiration time or not
                                    }

                                    preExpandedConfig = {
                                        ...preExpandedConfig,
                                        unlockConditions: commmonOutput.unlockConditions?.map(
                                            (unlockCondition) => 'address' in unlockCondition && unlockCondition.address === spentByAddress)
                                    };

                                }
                                return (
                                    <Output
                                        key={idx}
                                        outputId={output.id}
                                        output={output.output}
                                        amount={output.amount}
                                        network={network}
                                        showCopyAmount={true}
                                        isLinksDisabled={isLinksDisabled}
                                        preExpandedConfig={preExpandedConfig}
                                    />
                                )
                            })}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default TransactionPayload;
