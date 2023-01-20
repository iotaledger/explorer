/* eslint-disable jsdoc/require-param */
/* eslint-disable jsdoc/require-returns */
import React from "react";
import { Link } from "react-router-dom";
import { AssetProps } from "./AssetProps";
import TruncatedId from "./TruncatedId";

/**
 * Component which will display an asset.
 */
const Asset: React.FC<AssetProps> = ({ name, network, symbol, amount, price, value, tableFormat }) => (
    tableFormat ? (
        <tr>
            <td className="row middle highlight">
                <Link
                    to={`/${network}/foundry/${name}`}
                    className="margin-r-t"
                >
                    <TruncatedId id={name} />
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
                        <TruncatedId id={name} />
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

export default Asset;
