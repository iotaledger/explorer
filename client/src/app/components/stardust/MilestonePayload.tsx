import {
    IMilestonePayload, IProtocolParamsMilestoneOption, IReceiptMilestoneOption,
    PROTOCOL_PARAMETERS_MILESTONE_OPTION_TYPE, RECEIPT_MILESTONE_OPTION_TYPE
} from "@iota/iota.js-stardust";
import React, { ReactNode } from "react";
import { DateHelper } from "../../../helpers/dateHelper";
import AsyncComponent from "../../components/AsyncComponent";
import DataToggle from "../DataToggle";
import ReceiptPayload from "../stardust/ReceiptPayload";
import { MilestonePayloadProps } from "./MilestonePayloadProps";
import MilestoneSignaturesSection from "./MilestoneSignaturesSection";
import "./MilestonePayload.scss";

/**
 * Component which will display a milestone payload.
 */
class MilestonePayload extends AsyncComponent<MilestonePayloadProps> {
    /**
     * Create a new instance of MilestonePayload.
     * @param props The props.
     */
    constructor(props: MilestonePayloadProps) {
        super(props);
        this.state = {};
    }

    /**
     * Render the component.
     * @returns The node to render.
     */
    public render(): ReactNode {
        const { network, milestonePayload, history } = this.props;
        const {
            index, timestamp, previousMilestoneId, inclusionMerkleRoot,
            appliedMerkleRoot, metadata, options, signatures
        }: IMilestonePayload = milestonePayload;

        let receiptMilestoneOption: IReceiptMilestoneOption | null = null;
        let protocolParamsMilestoneOption: IProtocolParamsMilestoneOption | null = null;

        if (options?.some((option => option.type === RECEIPT_MILESTONE_OPTION_TYPE))) {
            receiptMilestoneOption = options.find(
                option => option.type === RECEIPT_MILESTONE_OPTION_TYPE
            ) as IReceiptMilestoneOption;
        }

        if (options?.some((option => option.type === PROTOCOL_PARAMETERS_MILESTONE_OPTION_TYPE))) {
            protocolParamsMilestoneOption = options.find(
                option => option.type === PROTOCOL_PARAMETERS_MILESTONE_OPTION_TYPE
            ) as IProtocolParamsMilestoneOption;
        }

        return (
            <React.Fragment>
                <div className="section milestone-payload">
                    <div className="section--data">
                        <div className="label">Index</div>
                        <div className="value">{index}</div>
                    </div>
                    <div className="section--data">
                        <div className="label">Date</div>
                        <div className="value">
                            {timestamp && DateHelper.format(
                                DateHelper.milliseconds(
                                    timestamp
                                )
                            )}
                        </div>
                    </div>
                    <div className="section--data">
                        <div className="label">Previous milestone Id</div>
                        <div className="value">{previousMilestoneId}</div>
                    </div>
                    <div className="section--data">
                        <div className="label">Inclusion Merkle Root</div>
                        <div className="value code">{inclusionMerkleRoot}</div>
                    </div>
                    <div className="section--data">
                        <div className="label">Applied Merkle Root</div>
                        <div className="value code">{appliedMerkleRoot}</div>
                    </div>
                    {metadata && (
                        <div className="section--data">
                            <div className="label">Metadata</div>
                            <div className="value">
                                <DataToggle sourceData={metadata} withSpacedHex={true} />
                            </div>
                        </div>
                    )}
                    {protocolParamsMilestoneOption && (
                        <React.Fragment>
                            <div className="section--data">
                                <div className="label">Target milestone index</div>
                                <div className="value code">
                                    {protocolParamsMilestoneOption?.targetMilestoneIndex}
                                </div>
                            </div>
                            <div className="section--data">
                                <div className="label">Target protocol version</div>
                                <div className="value code">
                                    {protocolParamsMilestoneOption?.protocolVersion}
                                </div>
                            </div>
                            <div className="section--data">
                                <div className="label">Protocol paramaters</div>
                                <div className="value code">
                                    {protocolParamsMilestoneOption?.params}
                                </div>
                            </div>
                        </React.Fragment>
                    )}
                    {receiptMilestoneOption && (
                        <div className="section">
                            <ReceiptPayload
                                network={network}
                                history={history}
                                payload={receiptMilestoneOption}
                                advancedMode={true}
                            />
                        </div>
                    )}
                </div>
                <MilestoneSignaturesSection signatures={signatures} />
            </React.Fragment>
        );
    }
}

export default MilestonePayload;

