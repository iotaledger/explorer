import { OutputResponse } from "@iota/sdk-wasm-nova/web";
import React from "react";

interface DelegationSectionProps {
    readonly outputs: OutputResponse[] | null;
}

const DelegationSection: React.FC<DelegationSectionProps> = ({ outputs }) => {
    const totalAmount = outputs?.reduce((acc, output) => acc + BigInt(output.output.amount), BigInt(0));

    if (outputs === null) {
        return null;
    }

    return (
        <div className="section transaction--section">
            <div className="card controlled-foundry--card">
                <div className="field">
                    <div className="card--label margin-b-t">Total amount</div>
                    <div className="card--value">{totalAmount?.toString()}</div>
                </div>
            </div>
        </div>
    );
};

export default DelegationSection;
