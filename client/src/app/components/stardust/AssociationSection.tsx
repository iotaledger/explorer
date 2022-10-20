import classNames from "classnames";
import React, { useContext, useState } from "react";
import { formatAmount } from "../../../helpers/stardust/valueFormatHelper";
import { AssociationType } from "../../../models/api/stardust/IAssociationsResponse";
import NetworkContext from "../../context/NetworkContext";
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
    const { tokenInfo } = useContext(NetworkContext);
    const [isExpanded, setIsExpanded] = useState(false);
    const [formatBalance, setFormatBalance] = useState(false);
    const count = outputs?.length;

    return (
        count ?
            <div
                className="section association-section"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="row association-section--header">
                    <div className={classNames("margin-r-t", "dropdown", { opened: isExpanded })}>
                        <DropdownIcon />
                    </div>
                    <h3>{ASSOCIATION_TYPE_TO_LABEL[association]} ({count})</h3>
                </div>
                {!isExpanded ? null : (
                    <React.Fragment>
                        <table className="association-section--table">
                            <thead>
                                <tr>
                                    <th>OUTPUT ID</th>
                                    <th>DATE CREATED</th>
                                    <th>AMOUNT</th>
                                </tr>
                            </thead>
                            <tbody>
                                {/* TODO mapping goes here */}
                                <tr>
                                    <td className="card">
                                        smr1qqqqweasdasdasdadasdadsasdasdasdasdasdasdasdasd
                                    </td>
                                    <td className="date-created">2021-06-18 01:32 AM (some time ago)</td>
                                    <td className="amount">
                                        <span
                                            onClick={() => setFormatBalance(!formatBalance)}
                                            className="pointer margin-r-5"
                                        >
                                            {formatAmount(Number(5000000), tokenInfo, formatBalance)}
                                        </span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>

                        <div className="association-section--cards">
                            <div className="card">
                                <div className="field">
                                    <div className="label">OUTPUT ID</div>
                                    <div className="value">smr1qqqqweasdasdasdadasdadsasdasdasdasdasdasdasdasd</div>
                                </div>
                                <div className="field">
                                    <div className="label">DATE CREATED</div>
                                    <div className="value">2021-06-18 01:32 AM (some time ago)</div>
                                </div>
                                <div className="field">
                                    <div className="label">AMOUNT</div>
                                    <div className="value">
                                        <span
                                            onClick={() => setFormatBalance(!formatBalance)}
                                            className="pointer margin-r-5"
                                        >
                                            {formatAmount(Number(12391293123), tokenInfo, formatBalance)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </React.Fragment>
                )}
            </div> : null
    );
};

export default AssociationSection;

