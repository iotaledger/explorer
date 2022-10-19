import classNames from "classnames";
import React, { useState } from "react";
import { AssociationType } from "../../../models/api/stardust/IAssociationsResponse";
import { ReactComponent as DropdownIcon } from "./../../../assets/dropdown-arrow.svg";
import "./AssociationSection.scss";

interface IAssociatedSectionProps {
    association: AssociationType;
    outputs: string[] | undefined;
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
    [AssociationType.NFT_ISSUER]: "Issuer Feature",
    [AssociationType.NFT_SENDER]: "Sender Feature"
};

const AssociationSection: React.FC<IAssociatedSectionProps> = ({ association, outputs }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const count = outputs?.length;

    return (
        count ?
            <div
                className="section"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="row">
                    <div className={classNames("margin-r-t", "dropdown", { opened: isExpanded })}>
                        <DropdownIcon />
                    </div>
                    <h3>{ASSOCIATION_TYPE_TO_LABEL[association]} ({count})</h3>
                </div>
            </div> : null
    );
};

export default AssociationSection;

