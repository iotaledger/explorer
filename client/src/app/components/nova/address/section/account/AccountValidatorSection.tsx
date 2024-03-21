import React from "react";
import { ValidatorResponse } from "@iota/sdk-wasm-nova/web";
import { formatAmount } from "~/helpers/stardust/valueFormatHelper";
import { useNetworkInfoNova } from "~/helpers/nova/networkInfo";

interface AccountValidatorSectionProps {
    readonly validatorDetails: ValidatorResponse | null;
}

const AccountValidatorSection: React.FC<AccountValidatorSectionProps> = ({ validatorDetails }) => {
    if (!validatorDetails) {
        return null;
    }
    const { tokenInfo, manaInfo } = useNetworkInfoNova((s) => s.networkInfo);
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
                    <div className="card--value">{formatAmount(validatorDetails.poolStake, tokenInfo, false)}</div>
                </div>
                <div className="field">
                    <div className="card--label margin-b-t">Validator Stake</div>
                    <div className="card--value">{formatAmount(validatorDetails.validatorStake, tokenInfo, false)}</div>
                </div>
                <div className="field">
                    <div className="card--label margin-b-t">Delegated Stake</div>
                    <div className="card--value">{formatAmount(delegatedStake, tokenInfo, false)}</div>
                </div>
                <div className="field">
                    <div className="card--label margin-b-t">Fixed Cost</div>
                    <div className="card--value">{formatAmount(validatorDetails?.fixedCost, manaInfo, false)}</div>
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
