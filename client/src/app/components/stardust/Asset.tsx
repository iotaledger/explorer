/* eslint-disable jsdoc/require-param */
/* eslint-disable jsdoc/require-returns */
import React from "react";
import { Link } from "react-router-dom";
import { AssetProps } from "./AssetProps";

/**
 * Component which will display an asset.
 */
const Asset: React.FC<AssetProps> = ({ name, network, symbol, amount, price, value, tableFormat }) => {
    const shortName = `${name.slice(0, 12)}...${name.slice(-12)}`;

    /**
     * Render the component.
     * @returns The node to render.
     */
    return (
        tableFormat ? (
            <tr>
                <td className="highlight">
                    <Link
                        to={`/${network}/foundry/${name}`}
                        className="margin-r-t"
                    >
                        {shortName}
                    </Link>
                </td>
                <td>{symbol ?? "-"}</td>
                <td>{amount ?? "-"}</td>
                <td>{price ?? "-"}</td>
                <td>{value ?? "-"}</td>
            </tr>
        ) : (
            <div className="asset-card">
                <div className="field">
                    <div className="label">Asset</div>
                    <div className="value highlight">
                        <Link
                            to={`/${network}/foundry/${name}`}
                            className="margin-r-t"
                        >
                            {shortName}
                        </Link>
                    </div>
                </div>
                <div className="field">
                    <div className="label">Symbol</div>
                    <div className="value">{symbol ?? "-"}</div>
                </div>
                <div className="field">
                    <div className="label">Quantity</div>
                    <div className="value">{amount ?? "-"}</div>
                </div>
                <div className="field">
                    <div className="label">Price</div>
                    <div className="value">{price ?? "-"}</div>
                </div>
                <div className="field">
                    <div className="label">Value</div>
                    <div className="value">{value ?? "-"}
                    </div>
                </div>
            </div >
        )
    );
};

export default Asset;
