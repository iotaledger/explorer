import React from "react";
import { RouteComponentProps } from "react-router-dom";
import mainHeaderMessage from "~assets/modals/nova/epoch/main-header.json";
import { useEpochProgress } from "~/helpers/nova/hooks/useEpochProgress";
import Modal from "~/app/components/Modal";
import NotFound from "~/app/components/NotFound";
import moment from "moment";

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
    const { epochUnixTimeRange, epochProgressPercent, registrationTime } = useEpochProgress(Number(epochIndex));

    if (epochIndex === null || !epochUnixTimeRange || moment().unix() < epochUnixTimeRange.from) {
        return <NotFound query={epochIndex} searchTarget="epoch" />;
    }

    let registrationTimeRemaining = "???";
    let epochTimeRemaining = "???";
    let epochFrom = "???";
    let epochTo = "???";

    if (registrationTime) {
        const epochStartTime = moment.unix(epochUnixTimeRange.from);
        const epochEndTime = moment.unix(epochUnixTimeRange.to - 1);
        epochFrom = epochStartTime.format("DD MMM HH:mm:ss");
        epochTo = epochEndTime.format("DD MMM HH:mm:ss");

        const diffToEpochEnd = epochEndTime.diff(moment());
        epochTimeRemaining = diffToEpochEnd > 0 ? moment(diffToEpochEnd).format("H:mm:ss") : "Finished";

        registrationTimeRemaining = moment.unix(registrationTime).fromNow();
    }

    return (
        <section className="epoch-page">
            <div className="wrapper">
                <div className="inner">
                    <div className="slot-page--header">
                        <div className="header--title row middle">
                            <h1>Epoch {epochIndex}</h1>
                            <Modal icon="info" data={mainHeaderMessage} />
                        </div>
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
                            <div className="value">{epochTimeRemaining}</div>
                        </div>
                        <div className="section--data">
                            <div className="label">Progress:</div>
                            <div className="value">{epochProgressPercent}%</div>
                        </div>
                        <div className="section--data">
                            <div className="label">Registration end:</div>
                            <div className="value">{registrationTimeRemaining}</div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default EpochPage;
