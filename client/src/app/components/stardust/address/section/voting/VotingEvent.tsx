import classNames from "classnames";
import React, { useEffect, useState } from "react";
import { IEventDetails } from "~helpers/stardust/hooks/useParticipationEventDetails";
import { IParticipationEventAnswer } from "~models/api/stardust/participation/IParticipationEventAnswer";
import { IParticipationEventQuestion } from "~models/api/stardust/participation/IParticipationEventQuestion";
import "./VotingEvent.scss";

interface VotingEventProps {
    readonly event: IEventDetails;
}

const VotingEvent: React.FC<VotingEventProps> = ({ event }) => {
    const [questions, setQuestions] = useState<IParticipationEventQuestion[]>([]);
    const [status, setStatus] = useState<string>();

    useEffect(() => {
        const eventQuestions = event.info?.payload.questions;
        const eventStatus = event.status?.status;
        if (eventQuestions) {
            setQuestions(eventQuestions);
        }
        setStatus(eventStatus);
    }, [event]);

    const getAnswer = (index: number, answers: IParticipationEventAnswer[]): React.ReactNode => {
        const answeredValue = event.participation.answers ? event.participation.answers[index] : undefined;
        const answer = answers.find((a) => a.value === answeredValue);
        return (
            <div className="field">
                <div className="card--label">Answer</div>
                <div className="card--value">
                    {answer?.text ?? "--"}
                    <div className="card--header-info margin-0">{answer?.additionalInfo}</div>
                </div>
            </div>
        );
    };

    return (
        <div className="card voting-event">
            <div className="card--header">
                <h3 className="card--header__title margin-b-t">
                    {event.info?.name}
                    <div
                        className={classNames(
                            "margin-l-t",
                            "voting-event__status",
                            { "voting-event__status--commencing": status === "commencing" || status === "upcoming" },
                            { "voting-event__status--holding": status === "holding" },
                            { "voting-event__status--ended": status === "ended" },
                        )}
                    >
                        {status}
                    </div>
                </h3>
                <div className="card--header-info margin-0">{event.info?.additionalInfo}</div>
            </div>
            <div className="card--content">
                {questions.map((question, idx) => (
                    <div key={idx} className="field">
                        <div className="card--label">Question</div>
                        <div className="card--value">
                            {question.text}
                            <div className="card--header-info margin-0">{question.additionalInfo}</div>
                        </div>
                        {getAnswer(idx, question.answers)}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default VotingEvent;
