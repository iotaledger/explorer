import React, { useState } from "react";
import { RouteComponentProps } from "react-router-dom";
import mainHeaderMessage from "~assets/modals/nova/epoch/main-header.json";
import { useEpochProgress } from "~/helpers/nova/hooks/useEpochProgress";
import Modal from "~/app/components/Modal";
import NotFound from "~/app/components/NotFound";
import moment from "moment";
import useEpochCommittee from "~/helpers/nova/hooks/useEpochCommittee";
import TruncatedId from "~/app/components/stardust/TruncatedId";
import "./EpochPage.scss";
import { useEpochStats } from "~/helpers/nova/hooks/useEpochStats";
import EpochControls from "~/app/components/nova/epoch/EpochControls";
import { useValidators } from "~/helpers/nova/hooks/useValidators";
import { getTimeRemaining } from "~/helpers/nova/novaTimeUtils";
import { formatAmount } from "~/helpers/stardust/valueFormatHelper";
import { useNetworkInfoNova } from "~/helpers/nova/networkInfo";

export interface EpochPageProps {
    /**
     * The network.
     */
    network: string;

    /**
     * The epoch index.
     */
    epochIndex: string;
}

const EpochPage: React.FC<RouteComponentProps<EpochPageProps>> = ({
    match: {
        params: { network, epochIndex },
    },
}) => {
    const { tokenInfo } = useNetworkInfoNova((s) => s.networkInfo);
    const [isFormatBalance, setIsFormatBalance] = useState(false);
    const { epochUnixTimeRange, epochProgressPercent, registrationTime } = useEpochProgress(Number(epochIndex));
    const { epochUnixTimeRange: currentEpochUnixTimeRange } = useEpochProgress();
    const { epochCommittee } = useEpochCommittee(network, epochIndex);
    const [epochStats] = useEpochStats(network, epochIndex);
    const { validators: candidates } = useValidators();

    if (
        epochIndex === null ||
        !epochUnixTimeRange ||
        !currentEpochUnixTimeRange ||
        epochUnixTimeRange.from >= currentEpochUnixTimeRange.to + (epochUnixTimeRange.to - epochUnixTimeRange.from)
    ) {
        return <NotFound query={epochIndex} searchTarget="epoch" />;
    }

    let registrationTimeRemaining = "???";
    let epochTimeRemaining = "???";
    let epochFrom = "???";
    let epochTo = "???";
    let futureEpochStartsIn = "???";

    const isFutureEpoch = epochUnixTimeRange.to > currentEpochUnixTimeRange.to;
    const validators = isFutureEpoch
        ? candidates?.map((candidate) => candidate.validator).filter((validator) => validator.active)
        : epochCommittee?.committee;

    const epochStartTime = moment.unix(epochUnixTimeRange.from);
    const epochEndTime = moment.unix(epochUnixTimeRange.to - 1);

    if (registrationTime) {
        epochFrom = epochStartTime.format("DD MMM HH:mm:ss");
        epochTo = epochEndTime.format("DD MMM HH:mm:ss");

        const diffToEpochEnd = epochEndTime.diff(moment());
        epochTimeRemaining = diffToEpochEnd > 0 ? getTimeRemaining(epochUnixTimeRange.to - 1) : "Finished";

        registrationTimeRemaining = moment.unix(registrationTime).fromNow();
    }

    if (isFutureEpoch) {
        futureEpochStartsIn = getTimeRemaining(epochUnixTimeRange.from);
        epochFrom = epochStartTime.format("DD MMM YYYY HH:mm:ss");
        epochTo = epochEndTime.format("DD MMM YYYY HH:mm:ss");
    }

    return (
        <section className="epoch-page">
            <div className="wrapper">
                <div className="inner">
                    <div className="epoch-page--header space-between">
                        <div className="header--title row middle">
                            <h1>Epoch {epochIndex}</h1>
                            <Modal icon="info" data={mainHeaderMessage} />
                        </div>
                        <EpochControls epochIndex={Number(epochIndex)} isFutureEpoch={isFutureEpoch} />
                    </div>
                    <div className="section">
                        <div className="section--header row row--tablet-responsive middle space-between">
                            <div className="row middle">
                                <h2>General</h2>
                            </div>
                        </div>
                        <div className="section--data">
                            <div className="label">From:</div>
                            <div className="value">{epochFrom}</div>
                        </div>
                        <div className="section--data">
                            <div className="label">To:</div>
                            <div className="value">{epochTo}</div>
                        </div>
                        <div className="section--data">
                            <div className="label">Time remaining:</div>
                            <div className="value">{isFutureEpoch ? "Not started" : epochTimeRemaining}</div>
                        </div>
                        <div className="section--data">
                            <div className="label">Progress:</div>
                            <div className="value">{isFutureEpoch ? "0%" : `${epochProgressPercent}%`}</div>
                        </div>
                        <div className="section--data">
                            <div className="label">Registration end:</div>
                            <div className="value">{isFutureEpoch ? "-" : registrationTimeRemaining}</div>
                        </div>
                        {!isFutureEpoch && (
                            <>
                                <div className="section--data">
                                    <div className="label">Total pool stake:</div>
                                    <div className="value">
                                        <span onClick={() => setIsFormatBalance(!isFormatBalance)} className="pointer margin-r-5">
                                            {formatAmount(epochCommittee?.totalStake ?? 0, tokenInfo, isFormatBalance)}
                                        </span>
                                    </div>
                                </div>
                                <div className="section--data">
                                    <div className="label">Total validator stake:</div>
                                    <div className="value">
                                        <span onClick={() => setIsFormatBalance(!isFormatBalance)} className="pointer margin-r-5">
                                            {formatAmount(epochCommittee?.totalValidatorStake ?? 0, tokenInfo, isFormatBalance)}
                                        </span>
                                    </div>
                                </div>
                                <div className="section--data">
                                    <div className="label">Total delegated stake:</div>
                                    <div className="value">
                                        <span onClick={() => setIsFormatBalance(!isFormatBalance)} className="pointer margin-r-5">
                                            {formatAmount(
                                                Number(epochCommittee?.totalStake ?? 0) - Number(epochCommittee?.totalValidatorStake ?? 0),
                                                tokenInfo,
                                                isFormatBalance,
                                            )}
                                        </span>
                                    </div>
                                </div>
                                <div className="section--data">
                                    <div className="label">Blocks:</div>
                                    <div className="value">{epochStats?.blockCount ?? 0}</div>
                                </div>
                                <div className="section--data">
                                    <div className="label">Transactions:</div>
                                    <div className="value">{epochStats?.perPayloadType?.transaction ?? 0}</div>
                                </div>
                            </>
                        )}
                        {isFutureEpoch && (
                            <>
                                <div className="section--data">
                                    <div className="label">Starts in:</div>
                                    <div className="value">{futureEpochStartsIn}</div>
                                </div>
                            </>
                        )}
                    </div>

                    {(validators ?? []).length > 0 && (
                        <div className="section all-validators__section">
                            <h2 className="all-validators__header">{isFutureEpoch ? "Candidates" : "Committee"}</h2>
                            <div className="all-validators__wrapper">
                                <div className="validator-item table-header">
                                    <div className="validator-item__address">Address</div>
                                    <div className="validator-item__fixed-cost">Cost</div>
                                    <div className="validator-item__pool-stake">Pool stake</div>
                                    <div className="validator-item__validator-stake">Validator stake</div>
                                    <div className="validator-item__delegator-stake">Delegated stake</div>
                                </div>
                                {validators?.map((validator, idx) => {
                                    const delegatorStake = Number(validator.poolStake) - Number(validator.validatorStake);
                                    return (
                                        <div className="validator-item" key={`validator-${idx}`}>
                                            <div className="validator-item__address">
                                                <TruncatedId id={validator.address} />
                                            </div>
                                            <div className="validator-item__fixed-cost">{validator.fixedCost.toString()}</div>
                                            <div className="validator-item__pool-stake">{validator.poolStake.toString()}</div>
                                            <div className="validator-item__validator-stake">{validator.validatorStake.toString()}</div>
                                            <div className="validator-item__delegator-stake">{delegatorStake}</div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default EpochPage;
