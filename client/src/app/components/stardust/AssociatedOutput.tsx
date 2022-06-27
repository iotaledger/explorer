/* eslint-disable jsdoc/require-param */
/* eslint-disable jsdoc/require-returns */
import React from "react";
import { DateHelper } from "../../../helpers/dateHelper";
import { AssociationType, IAssociatedOutput } from "../../../models/api/stardust/IAssociatedOutputsResponse";
import Output from "./Output";

interface AssociatedOutputProps {
    network: string;
    associatedOutput: IAssociatedOutput;
    isMobile: boolean;
}

const ASSOCIATION_TYPE_TO_LABEL = {
    [AssociationType.BASIC_SENDER]: "Sender Feature",
    [AssociationType.BASIC_EXPIRATION_RETURN]: "Expiration Return Unlock Condtition",
    [AssociationType.BASIC_STORAGE_RETURN]: "Storage Deposit Return Unlock Condition",
    [AssociationType.ALIAS_STATE_CONTROLLER]: "State Controller Address Unlock Condition",
    [AssociationType.ALIAS_GOVERNOR]: "Governor Address Unlock Condition",
    [AssociationType.ALIAS_ISSUER]: "Issuer Feature",
    [AssociationType.ALIAS_SENDER]: "Sender Feature",
    [AssociationType.FOUNDRY_ALIAS]: "Immutable Alias Address Unlock Condition",
    [AssociationType.NFT_STORAGE_RETURN]: "Storage Deposit Return Unlock Condition",
    [AssociationType.NFT_EXPIRATION_RETURN]: "Expiration Return Unlock Condtition",
    [AssociationType.NFT_SENDER]: "Sender Feature"
};

const AssociatedOutput: React.FC<AssociatedOutputProps> = ({ network, associatedOutput, isMobile }) => {
    if (!associatedOutput.outputDetails) {
        return null;
    }

    const output = associatedOutput.outputDetails.output;
    const outputMetadata = associatedOutput.outputDetails.metadata;
    const dateCreated = DateHelper.formatShort(outputMetadata.milestoneTimestampBooked * 1000);
    const associationLabel = ASSOCIATION_TYPE_TO_LABEL[associatedOutput.association];

    const outputTableRow = (
        <tr>
            <td className="card">
                <Output
                    key={associatedOutput.outputId}
                    outputId={associatedOutput.outputId}
                    output={output}
                    amount={Number(output.amount)}
                    network={network}
                    showCopyAmount={false}
                />
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
                <Output
                    key={associatedOutput.outputId}
                    outputId={associatedOutput.outputId}
                    output={output}
                    amount={Number(output.amount)}
                    network={network}
                    showCopyAmount={false}
                />
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
