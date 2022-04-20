import React from "react";
import "./Transaction.scss";
import { AssetProps } from "./AssetProps";
import { Link } from "react-router-dom";

/**
 * Component which will display an asset.
 */
const Asset: React.FC<AssetProps> = ({ name, network, symbol, amount, price, value, tableFormat }) => {
    const shortName = `${name.slice(0, 12)}...${name.slice(-12)}`;
    const addPaddingLeft = { paddingLeft: "16px" };
    /**
     * Render the component.
     * @returns The node to render.
     */
    return (
        tableFormat ? (
            <tr>
                <td className="value code highlight">
                    <Link
                        to={`/${network}/search/${name}`}
                        className="margin-r-t"
                    >
                        {shortName}
                    </Link>
                </td>
                <td style={addPaddingLeft}>{symbol ?? "-"}</td>
                <td style={addPaddingLeft}>{amount ?? "-"}</td>
                <td style={addPaddingLeft}>{price ?? "-"}</td>
                <td style={addPaddingLeft}>{value ?? "-"}</td>
            </tr>
        ) : (
            <div className="transaction-card">
                <div className="field">
                    <div className="label">Asset</div>
                    <div className="value message-id">
                        <Link
                            to={`/${network}/search/${name}`}
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
}

export default Asset;

