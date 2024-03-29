import { OutputWithMetadataResponse, ValidatorResponse } from "@iota/sdk-wasm-nova/web";
import React, { useState } from "react";
import TruncatedId from "~/app/components/stardust/TruncatedId";
import { useNetworkInfoNova } from "~/helpers/nova/networkInfo";
import { formatAmount } from "~/helpers/stardust/valueFormatHelper";

interface AccountValidatorSectionProps {
    readonly validatorDetails: ValidatorResponse | null;
    readonly validatorDelegationOutputs: OutputWithMetadataResponse[] | null;
}

const AccountValidatorSection: React.FC<AccountValidatorSectionProps> = ({ validatorDetails, validatorDelegationOutputs }) => {
    const [isFormatBalance, setIsFormatBalance] = useState<boolean>(false);
    const { name: network, tokenInfo, manaInfo } = useNetworkInfoNova((state) => state.networkInfo);
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
                {validatorDelegationOutputs && (
                    <div className="field">
                        <div className="card--label margin-b-t">Delegated outputs</div>
                        {validatorDelegationOutputs?.map((output, index) => (
                            <div key={index} className="card--value row">
                                <TruncatedId
                                    id={output.metadata.outputId}
                                    link={`/${network}/output/${output.metadata.outputId}`}
                                    showCopyButton={true}
                                />
                                <span onClick={() => setIsFormatBalance(!isFormatBalance)} className="pointer margin-l-t">
                                    {formatAmount(output.output.amount, tokenInfo, isFormatBalance)}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AccountValidatorSection;
