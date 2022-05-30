import React from "react";
import "./Transaction.scss";
import { Link } from "react-router-dom";
import { ControlledFoundryProps } from "./ControlledFoundryProps";

const ControlledFoundry: React.FC<ControlledFoundryProps> = ({ foundryId, tableFormat, network }) => {

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
                </div>
            </div >
        )
    );
};

export default ControlledFoundry;

