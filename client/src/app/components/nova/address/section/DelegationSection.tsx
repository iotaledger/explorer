import React from "react";

interface DelegationSectionProps {
    readonly delegation: string | null;
}

const DelegationSection: React.FC<DelegationSectionProps> = ({ delegation }) => {
    return (
        <div className="section transaction--section">
            <div className="card controlled-foundry--card">
                <div className="field">
                    <div className="card--label margin-b-t">Delegation</div>
                    <div className="card--value">{delegation}</div>
                </div>
            </div>
        </div>
    );
};

export default DelegationSection;
