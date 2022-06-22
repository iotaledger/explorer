/* eslint-disable jsdoc/require-param */
/* eslint-disable jsdoc/require-returns */
import classNames from "classnames";
import React, { useState } from "react";
import { ReactComponent as DropdownIcon } from "../../../assets/dropdown-arrow.svg";
import { DateHelper } from "../../../helpers/dateHelper";
import { NameHelper } from "../../../helpers/stardust/nameHelper";
import { AssociationType, IAssociatedOutput } from "../../../models/api/stardust/IAssociatedOutputsResponse";
import Output from "./Output";

interface AssociatedOutputProps {
    network: string;
    associatedOutput: IAssociatedOutput;
    isMobile: boolean;
}

const ASSOCIATION_TYPE_TO_LABEL = {
    [AssociationType.BASIC_SENDER]: "Sender Block Feature",
    [AssociationType.BASIC_EXPIRATION_RETURN]: "Expiration Return Unlock Condtition",
    [AssociationType.BASIC_STORAGE_RETURN]: "Storage Deposit Return Unlock Condition",
    [AssociationType.ALIAS_STATE_CONTROLLER]: "State Controller Address Unlock Condition",
    [AssociationType.ALIAS_GOVERNOR]: "Governor Address Unlock Condition",
    [AssociationType.ALIAS_ISSUER]: "Issuer Block Feature",
    [AssociationType.ALIAS_SENDER]: "Sender Block Feature",
    [AssociationType.FOUNDRY_ALIAS]: "Immutable Alias Address Unlock Condition",
    [AssociationType.NFT_STORAGE_RETURN]: "Storage Deposit Return Unlock Condition",
    [AssociationType.NFT_EXPIRATION_RETURN]: "Expiration Return Unlock Condtition",
    [AssociationType.NFT_SENDER]: "Sender Block Feature"
};

const AssociatedOutput: React.FC<AssociatedOutputProps> = ({ network, associatedOutput, isMobile }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    if (!associatedOutput.outputDetails) {
        return null;
    }

    const output = associatedOutput.outputDetails.output;
    const outputMetadata = associatedOutput.outputDetails.metadata;
    const outputName = NameHelper.getOutputTypeName(output.type);
    const dateCreated = DateHelper.formatShort(outputMetadata.milestoneTimestampBooked * 1000);
    const associationLabel = ASSOCIATION_TYPE_TO_LABEL[associatedOutput.association];

    const outputLabelDiv = (
        <div className="output--label" onClick={() => setIsExpanded(!isExpanded)}>
            <div className={classNames("dropdown--icon", "margin-r-t", { opened: isExpanded })}>
                <DropdownIcon />
            </div>
            <button type="button" className="margin-r-t color">
                {outputName}
            </button>
        </div>
    );

    const outputTableRow = (
        <tr>
            <td className="card">
                {outputLabelDiv}
                {isExpanded && (
                    <Output
                        id={associatedOutput.outputId}
                        output={output}
                        amount={Number(output.amount)}
                        network={network}
                    />
                )}
            </td>
            <td className="found-in">{associationLabel}</td>
            <td className="date-created">{dateCreated}</td>
        </tr>
    );

    const outputMobileCard = (
        <div className="card">
            <div className="field">
                <div className="label">
                    Output type
                </div>
                <div className="value">
                    {outputLabelDiv}
                    {isExpanded && (
                        <Output
                            id={associatedOutput.outputId}
                            output={output}
                            amount={Number(output.amount)}
                            network={network}
                        />
                    )}
                </div>
            </div>
            <div className="field found-in">
                <div className="label">Address found in</div>
                <div className="value">{associationLabel}</div>
            </div>
            <div className="field date-created">
                <div className="label">Date created</div>
                <div className="value">{dateCreated}</div>
            </div>
        </div>
    );

    return !isMobile ? outputTableRow : outputMobileCard;
};

export default AssociatedOutput;
