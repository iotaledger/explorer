import React from "react";
import "./Transaction.scss";
import { Link } from "react-router-dom";
import { ControlledFoundryProps } from "./ControlledFoundryProps";

const ControlledFoundry: React.FC<ControlledFoundryProps> = ({ foundryId, dateCreated, tableFormat, network }) => {
    const addPaddingLeft = { paddingLeft: "16px" };

    return (
        tableFormat ? (
            <tr>
                <td className="value code highlight">
                    <Link
                        to={`/${network}/search/${foundryId}`}
                        className="margin-r-t"
                    >
                        {foundryId}
                    </Link>
                </td>
                <td style={addPaddingLeft}>{dateCreated ?? "-"}</td>
            </tr>
        ) : (
            <div className="transaction-card">
                <div className="field">
                    <div className="label">Foundry Id</div>
                    <div className="value message-id">
                        <Link
                            to={`/${network}/search/${foundryId}`}
                            className="margin-r-t"
                        >
                            {foundryId}
                        </Link>
                    </div>
                </div>
                <div className="field">
                    <div className="label">Date Created</div>
                    <div className="value">{dateCreated ?? "-"}</div>
                </div>
            </div >
        )
    );
};

export default ControlledFoundry;

