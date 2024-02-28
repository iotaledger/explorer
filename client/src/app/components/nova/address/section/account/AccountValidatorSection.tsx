import React from "react";
import { ValidatorResponse } from "@iota/sdk-wasm-nova/web";

interface AccountValidatorSectionProps {
    readonly validatorDetails: ValidatorResponse | null;
}

const AccountValidatorSection: React.FC<AccountValidatorSectionProps> = ({ validatorDetails }) => {
    if (!validatorDetails) {
        return null;
    }

    const delegatedStake = BigInt(validatorDetails.poolStake) - BigInt(validatorDetails.validatorStake);

    return (
        <div className="section transaction--section">
            <div className="card controlled-foundry--card">
                <div className="field">
                    <div className="card--label margin-b-t">Active</div>
                    <div className="card--value">{validatorDetails.active ? "Yes" : "No"}</div>
                </div>
                <div className="field">
                    <div className="card--label margin-b-t">Staking End Epoch</div>
                    <div className="card--value">{validatorDetails.stakingEndEpoch}</div>
                </div>
                <div className="field">
                    <div className="card--label margin-b-t">Pool Stake</div>
                    <div className="card--value">{String(validatorDetails.poolStake)}</div>
                </div>
                <div className="field">
                    <div className="card--label margin-b-t">Validator Stake</div>
                    <div className="card--value">{String(validatorDetails.validatorStake)}</div>
                </div>
                <div className="field">
                    <div className="card--label margin-b-t">Delegated Stake</div>
                    <div className="card--value">{String(delegatedStake)}</div>
                </div>
                <div className="field">
                    <div className="card--label margin-b-t">Fixed Cost</div>
                    <div className="card--value">{Number(validatorDetails?.fixedCost)}</div>
                </div>
                <div className="field">
                    <div className="card--label margin-b-t">Latest Supported Protocol Version</div>
                    <div className="card--value">{validatorDetails?.latestSupportedProtocolVersion}</div>
                </div>
                <div className="field">
                    <div className="card--label margin-b-t">Latest Supported Protocol Hash</div>
                    <div className="card--value">{validatorDetails?.latestSupportedProtocolHash}</div>
                </div>
            </div>
        </div>
    );
};

export default AccountValidatorSection;
