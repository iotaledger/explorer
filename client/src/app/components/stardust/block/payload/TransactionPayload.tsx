import { CommonOutput, ExpirationUnlockCondition, OutputType, UnlockConditionType } from "@iota/sdk-wasm/web";
import React, { useEffect, useState } from "react";
import { DateHelper } from "~/helpers/dateHelper";
import transactionPayloadMessage from "~assets/modals/stardust/block/transaction-payload.json";
import { useMilestoneDetails } from "~helpers/hooks/useMilestoneDetails";
import Modal from "../../../Modal";
import Input from "../../Input";
import Output from "../../Output";
import Unlocks from "../../Unlocks";
import { IPreExpandedConfig } from "../../interfaces";
import "./TransactionPayload.scss";
import { TransactionPayloadProps } from "./TransactionPayloadProps";

/**
 * Component which will display a transaction payload.
 */
const TransactionPayload: React.FC<TransactionPayloadProps> = ({ network, inputs, unlocks, outputs, header, isLinksDisabled, milestoneIndex }) => {

    const [milestoneDetails] = useMilestoneDetails(network, milestoneIndex ?? null);
    const [milestoneUnixTimestamp, setMilestoneUnixTimestamp] = useState<number | undefined>();
    const [inputsPreExpandedConfig, setInputsPreExpandedConfig] = useState<IPreExpandedConfig[]>([]);

    useEffect(() => {
        if (milestoneDetails?.milestone?.timestamp) {
            setMilestoneUnixTimestamp(DateHelper.milliseconds(milestoneDetails.milestone.timestamp));
        }
    }, [milestoneDetails]);

    useEffect(() => {
        if (milestoneUnixTimestamp) {
            // calculate, for input basic outputs, who spent it, 
            // the expiration unlock condition or the address unlock condition
            const inputsPreExpandedConfig: IPreExpandedConfig[] = inputs.map((input) => {
                let preExpandedConfig: IPreExpandedConfig = {
                    isPreExpanded: input?.output?.output?.type === OutputType.Basic,
                };
                if (input?.output?.output && 'unlockConditions' in input.output.output) {
                    const commmonOutput = input.output.output as unknown as CommonOutput;
                    const expirationUnlockCondition: ExpirationUnlockCondition | undefined = (commmonOutput.unlockConditions?.find(unlockCondition => unlockCondition.type === UnlockConditionType.Expiration) as ExpirationUnlockCondition);
                    if (expirationUnlockCondition && milestoneUnixTimestamp > expirationUnlockCondition.unixTime) {
                        preExpandedConfig = {
                            ...preExpandedConfig,
                            unlockConditions: commmonOutput.unlockConditions?.map(
                                (unlockCondition) => unlockCondition.type === UnlockConditionType.Expiration)
                        };
                    } else {
                        preExpandedConfig = {
                            ...preExpandedConfig,
                            unlockConditions: commmonOutput.unlockConditions?.map(
                                (unlockCondition) => unlockCondition.type === UnlockConditionType.Address)
                        };
                    }

                }
                return preExpandedConfig
            })
            setInputsPreExpandedConfig(inputsPreExpandedConfig);
        }
    }, [milestoneUnixTimestamp]);

    // for basic outputs, expand the address unlock condition
    const outputsPreExpandedConfig: IPreExpandedConfig[] = outputs.map((output) => {
        let preExpandedConfig: IPreExpandedConfig = {
            isPreExpanded: output?.output?.type === OutputType.Basic,
        };
        if ('unlockConditions' in output.output) {
            const commmonOutput = output.output as CommonOutput;
            preExpandedConfig = {
                ...preExpandedConfig,
                unlockConditions: commmonOutput.unlockConditions?.map(
                    (unlockCondition) => unlockCondition.type === UnlockConditionType.Address)
            };
        }
        return preExpandedConfig
    });

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
                        {inputs.map((input, idx) => (<Input key={idx} network={network} input={input} preExpandedConfig={inputsPreExpandedConfig[idx]} />))}
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
}

export default TransactionPayload;
