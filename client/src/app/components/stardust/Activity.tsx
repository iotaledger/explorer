/* eslint-disable react/no-unescaped-entities */
/* eslint-disable react/function-component-definition */
import React from "react";
import "./Activity.scss";
import { ActivityProps } from "./ActivityProps";

export const Activity: React.FC<ActivityProps> = ({ transactionId, date, action, status, price, tableFormat }) =>
    (tableFormat ? (
        <tr>
            <td className="value transaction-id">
                {transactionId.slice(0, 12)}...{transactionId.slice(-12)}
            </td>
            <td className="date">{date}</td>
            <td className="date">{action}</td>
            <td><span className="status">{status}</span></td>
            <td className="price">{price}</td>
        </tr>
    ) : (
        <div className="activity-card">
            <div className="field">
                <div className="label">Transaction Id</div>
                <div className="value transaction-id">
                    {transactionId.slice(0, 12)}...{transactionId.slice(-12)}
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
    ));
