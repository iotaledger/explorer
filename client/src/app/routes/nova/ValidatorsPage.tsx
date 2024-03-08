import React from "react";
import TruncatedId from "~/app/components/stardust/TruncatedId";
import { useValidators } from "~/helpers/nova/hooks/useValidators";
import "./ValidatorsPage.scss";

const ValidatorsPage: React.FC = () => {
    const { validators, error } = useValidators();

    // Build rank by stake map
    const addressToRankByStake = new Map<string, number>();
    const validatorsSortedByPoolStake = [...(validators ?? [])].sort((a, b) => (a.validator.poolStake > b.validator.poolStake ? -1 : 1));
    for (let i = 0; i < validatorsSortedByPoolStake.length; i++) {
        addressToRankByStake.set(validatorsSortedByPoolStake[i].validator.address, i + 1);
    }

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
                                    <div className="validator-item__is-candidate">Candidate?</div>
                                    <div className="validator-item__is-elected">Elected?</div>
                                    <div className="validator-item__fixed-cost">Fixed cost</div>
                                    <div className="validator-item__stake">Stake (Own/Delegated)</div>
                                    <div className="validator-item__cumulative-stake">Cumulative stake</div>
                                    <div className="validator-item__delegators">Delegators</div>
                                    <div className="validator-item__rank">Rank by stake</div>
                                </div>
                                {validators.map((validatorResponse, idx) => {
                                    const validator = validatorResponse.validator;
                                    const inCommittee = validatorResponse.inCommittee;
                                    const delegatedStake = validator.poolStake - validator.validatorStake;

                                    return (
                                        <div className="validator-item" key={`validator-${idx}`}>
                                            <div className="validator-item__address">
                                                <TruncatedId id={validator.address} />
                                            </div>
                                            <div className="validator-item__is-candidate">{(!inCommittee).toString()}</div>
                                            <div className="validator-item__is-elected">{inCommittee.toString()}</div>
                                            <div className="validator-item__fixed-cost">{validator.fixedCost.toString()}</div>
                                            <div className="validator-item__stake">
                                                {`${validator.validatorStake.toString()} / ${delegatedStake}`}
                                            </div>
                                            <div className="validator-item__cumulative-stake">{validator.poolStake.toString()}</div>
                                            <div className="validator-item__delegators">???</div>
                                            <div className="validator-item__rank">{addressToRankByStake.get(validator.address)}</div>
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
