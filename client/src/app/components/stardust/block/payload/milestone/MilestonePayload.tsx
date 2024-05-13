import {
    MilestoneOptionType,
    MilestonePayload as IMilestonePayload,
    ProtocolParamsMilestoneOption,
    ReceiptMilestoneOption,
} from "@iota/sdk-wasm-stardust/web";
import React, { ReactNode } from "react";
import { MilestonePayloadProps } from "./MilestonePayloadProps";
import MilestoneSignaturesSection from "./MilestoneSignaturesSection";
import { DateHelper } from "~helpers/dateHelper";
import AsyncComponent from "../../../../AsyncComponent";
import DataToggle from "../../../../DataToggle";
import TruncatedId from "../../../TruncatedId";
import ReceiptPayload from "../ReceiptPayload";
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
            index,
            timestamp,
            previousMilestoneId,
            inclusionMerkleRoot,
            appliedMerkleRoot,
            metadata,
            options,
            signatures,
        }: IMilestonePayload = milestonePayload;

        let receiptMilestoneOption: ReceiptMilestoneOption | null = null;
        let protocolParamsMilestoneOption: ProtocolParamsMilestoneOption | null = null;

        if (options?.some((option) => option.type === MilestoneOptionType.Receipt)) {
            receiptMilestoneOption = options.find((option) => option.type === MilestoneOptionType.Receipt) as ReceiptMilestoneOption;
        }

        if (options?.some((option) => option.type === MilestoneOptionType.ProtocolParams)) {
            protocolParamsMilestoneOption = options.find(
                (option) => option.type === MilestoneOptionType.ProtocolParams,
            ) as ProtocolParamsMilestoneOption;
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
                        <div className="value">{timestamp && DateHelper.format(DateHelper.milliseconds(timestamp))}</div>
                    </div>
                    <div className="section--data">
                        <div className="label">Previous milestone Id</div>
                        <div className="value">
                            <TruncatedId id={previousMilestoneId} />
                        </div>
                    </div>
                    <div className="section--data">
                        <div className="label">Inclusion Merkle Root</div>
                        <div className="value code">
                            <TruncatedId id={inclusionMerkleRoot} />
                        </div>
                    </div>
                    <div className="section--data">
                        <div className="label">Applied Merkle Root</div>
                        <div className="value code">
                            <TruncatedId id={appliedMerkleRoot} />
                        </div>
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
                                <div className="value code">{protocolParamsMilestoneOption?.targetMilestoneIndex}</div>
                            </div>
                            <div className="section--data">
                                <div className="label">Target protocol version</div>
                                <div className="value code">{protocolParamsMilestoneOption?.protocolVersion}</div>
                            </div>
                            <div className="section--data">
                                <div className="label">Protocol paramaters</div>
                                <div className="value code">{protocolParamsMilestoneOption?.params}</div>
                            </div>
                        </React.Fragment>
                    )}
                    {receiptMilestoneOption && (
                        <div className="section">
                            <ReceiptPayload network={network} history={history} payload={receiptMilestoneOption} advancedMode={true} />
                        </div>
                    )}
                </div>
                <MilestoneSignaturesSection signatures={signatures} />
            </React.Fragment>
        );
    }
}

export default MilestonePayload;
