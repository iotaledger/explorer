/* eslint-disable jsdoc/require-param */
/* eslint-disable jsdoc/require-returns */
import moment from "moment";
import React, { useContext, useState } from "react";
import { DateHelper } from "../../../helpers/dateHelper";
import { formatAmount } from "../../../helpers/stardust/valueFormatHelper";
import { AssociationType, IAssociatedOutput } from "../../../models/api/stardust/IAssociatedOutputsResponse";
import NetworkContext from "../../context/NetworkContext";
import Tooltip from "../Tooltip";
import Output from "./Output";

interface AssociatedOutputProps {
    network: string;
    associatedOutput: IAssociatedOutput;
    isMobile: boolean;
}

const ASSOCIATION_TYPE_TO_LABEL = {
    [AssociationType.BASIC_ADDRESS]: "Address Unlock Condition",
    [AssociationType.BASIC_SENDER]: "Sender Feature",
    [AssociationType.BASIC_EXPIRATION_RETURN]: "Expiration Return Unlock Condtition",
    [AssociationType.BASIC_STORAGE_RETURN]: "Storage Deposit Return Unlock Condition",
    [AssociationType.ALIAS_ID]: "Alias Id",
    [AssociationType.ALIAS_STATE_CONTROLLER]: "State Controller Address Unlock Condition",
    [AssociationType.ALIAS_GOVERNOR]: "Governor Address Unlock Condition",
    [AssociationType.ALIAS_ISSUER]: "Issuer Feature",
    [AssociationType.ALIAS_SENDER]: "Sender Feature",
    [AssociationType.FOUNDRY_ALIAS]: "Immutable Alias Address Unlock Condition",
    [AssociationType.NFT_ID]: "Nft Id",
    [AssociationType.NFT_ADDRESS]: "Address Unlock Condition",
    [AssociationType.NFT_STORAGE_RETURN]: "Storage Deposit Return Unlock Condition",
    [AssociationType.NFT_EXPIRATION_RETURN]: "Expiration Return Unlock Condtition",
    [AssociationType.NFT_SENDER]: "Sender Feature"
};

const AssociatedOutput: React.FC<AssociatedOutputProps> = ({ network, associatedOutput, isMobile }) => {
    if (!associatedOutput.outputDetails) {
        return null;
    }

    const { outputId, outputDetails, associations } = associatedOutput;
    const output = outputDetails.output;
    const outputMetadata = outputDetails.metadata;
    const dateCreated = DateHelper.formatShort(outputMetadata.milestoneTimestampBooked * 1000);
    const ago = moment(outputMetadata.milestoneTimestampBooked * 1000).fromNow();
    const { tokenInfo } = useContext(NetworkContext);
    const [formatBalance, setFormatBalance] = useState(false);
    const amount = output.amount;

    const associationLabel = ASSOCIATION_TYPE_TO_LABEL[associations[0]];
    const additionalAssociationsLabel = associations.length > 1 ? `+${associations.length - 1} more` : null;
    const additionalAssociations = associations.length > 1 ? (
        <div>
            {associations.slice(1).map((a, idx) => (
                <div key={idx} style={{ marginTop: idx > 0 ? "4px" : "0" }}>{ASSOCIATION_TYPE_TO_LABEL[a]}</div>
            ))}
        </div>
    ) : null;

    const outputTableRow = (
        <tr>
            <td className="card">
                <Output
                    key={outputId}
                    outputId={outputId}
                    output={output}
                    amount={Number(output.amount)}
                    network={network}
                    showCopyAmount={false}
                />
            </td>
            <td className="found-in">
                <div className="found-in--wrapper">
                    {associationLabel}
                    {additionalAssociationsLabel && (
                        <Tooltip tooltipContent={additionalAssociations}>
                            &nbsp;{additionalAssociationsLabel}
                        </Tooltip>
                    )}
                </div>
            </td>
            <td className="date-created">{dateCreated} ({ago})</td>
            <td className="amount">
                <span
                    onClick={() => setFormatBalance(!formatBalance)}
                    className="pointer margin-r-5"
                >
                    {formatAmount(Number(amount), tokenInfo, formatBalance)}
                </span>
            </td>
        </tr>
    );

    const outputMobileCard = (
        <div className="card">
            <div className="field">
                <div className="label">
                    Output type
                </div>
                <Output
                    key={outputId}
                    outputId={outputId}
                    output={output}
                    amount={Number(output.amount)}
                    network={network}
                    showCopyAmount={false}
                />
            </div>
            <div className="field found-in">
                <div className="label">Address found in</div>
                <div className="value">
                    <div className="found-in--wrapper">
                        {
                            associations.map((a, idx) => (
                                <div key={idx}>{ASSOCIATION_TYPE_TO_LABEL[a]}</div>
                            ))
                        }
                    </div>
                </div>
            </div>
            <div className="field date-created">
                <div className="label">Date created</div>
                <div className="value">{dateCreated} ({ago})</div>
            </div>
            <div className="field amount">
                <div className="label">Amount</div>
                <div className="value">
                    <span
                        onClick={() => setFormatBalance(!formatBalance)}
                        className="pointer margin-r-5"
                    >
                        {formatAmount(Number(amount), tokenInfo, formatBalance)}
                    </span>
                </div>
            </div>
        </div>
    );

    return !isMobile ? outputTableRow : outputMobileCard;
};

export default AssociatedOutput;
