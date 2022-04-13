import { FunctionComponent } from 'react';
import "./Transaction.scss";
import { ActivityProps } from "./ActivityProps";

export const Activity: FunctionComponent<ActivityProps> = ({ hash, date, action, status, price, tableFormat  }) => 
    tableFormat ? (
        <tr>
            <td className="value code highlight">
                {hash}
            </td>
            <td className="date">{date}</td>
            <td className="date">{action}</td>
            <td><span className="status">{status}</span></td>
            <td className="price">{price}</td>
        </tr>
    ) : (
        <div className="transaction-card">
            <div className="field">
                <div className="label">T'XN Hash</div>
                <div className="value message-id">
                    {hash}
                </div>
            </div>
            <div className="field">
                <div className="label">Date</div>
                <div className="value">{date}
                </div>
            </div>
            <div className="field">
                <div className="label">Action</div>
                <div className="value">{action}</div>
            </div>
            <div className="field">
                <div className="label">Status</div>
                <div className="value">{status}</div>
            </div>
            <div className="field">
                <div className="label">Price</div>
                <div className="value">{price}
                </div>
            </div>
        </div>
    )