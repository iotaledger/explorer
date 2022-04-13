import { FunctionComponent } from 'react';
import "./Transaction.scss";
import { AssetProps } from "./AssetProps";

export const Asset: FunctionComponent<AssetProps> = ({ asset, symbol, quantity, price, value, tableFormat  }) => 
    tableFormat ? (
        <tr>
            <td className="value code highlight">
                {asset}
            </td>
            <td>{symbol}</td>
            <td>{quantity}</td>
            <td>{price}</td>
            <td>{value}</td>
        </tr>
    ) : (
        <div className="transaction-card">
            <div className="field">
                <div className="label">Asset</div>
                <div className="value message-id">
                    {asset}
                </div>
            </div>
            <div className="field">
                <div className="label">Symbol</div>
                <div className="value">{symbol}
                </div>
            </div>
            <div className="field">
                <div className="label">Quantity</div>
                <div className="value">{quantity}</div>
            </div>
            <div className="field">
                <div className="label">Price</div>
                <div className="value">{price}</div>
            </div>
            <div className="field">
                <div className="label">Value</div>
                <div className="value">{value}
                </div>
            </div>
        </div >
    )
