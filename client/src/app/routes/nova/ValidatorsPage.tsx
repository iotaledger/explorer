import React from "react";
import TruncatedId from "~/app/components/stardust/TruncatedId";
import { useValidators } from "~/helpers/nova/hooks/useValidators";
import "./ValidatorsPage.scss";

const ValidatorsPage: React.FC = () => {
    const { validators, error } = useValidators();

    return (
        <section className="validators-page">
            <div className="wrapper">
                <div className="inner">
                    <div className="validators-page__header">
                        <div className="header__title row middle">
                            <h1>Validators</h1>
                        </div>
                    </div>

                    {validators !== null && (
                        <div className="all-validators__section">
                            <h2 className="all-validators__header">All Validators</h2>
                            <div className="all-validators__wrapper">
                                <div className="validator-item table-header">
                                    <div className="validator-item__address">Address</div>
                                    <div className="validator-item__state">Active?</div>
                                    <div className="validator-item__fixed-cost">Cost</div>
                                    <div className="validator-item__pool-stake">Pool stake</div>
                                    <div className="validator-item__validator-stake">Validator stake</div>
                                    <div className="validator-item__delegators">Delegators</div>
                                    <div className="validator-item__staking-end-epoch">End epoch</div>
                                </div>
                                {validators.map((validatorResponse, idx) => {
                                    const validator = validatorResponse.validator;
                                    return (
                                        <div className="validator-item" key={`validator-${idx}`}>
                                            <div className="validator-item__address">
                                                <TruncatedId id={validator.address} />
                                            </div>
                                            <div className="validator-item__state">{validator.active.toString()}</div>
                                            <div className="validator-item__fixed-cost">{validator.fixedCost.toString()}</div>
                                            <div className="validator-item__pool-stake">{validator.poolStake.toString()}</div>
                                            <div className="validator-item__validator-stake">{validator.validatorStake.toString()}</div>
                                            <div className="validator-item__delegators">123</div>
                                            <div className="validator-item__staking-end-epoch">{validator.stakingEndEpoch}</div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {error && <p className="danger">Failed to retrieve validators. {error}</p>}
                </div>
            </div>
        </section>
    );
};

export default ValidatorsPage;
