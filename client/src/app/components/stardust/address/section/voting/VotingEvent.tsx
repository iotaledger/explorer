import classNames from "classnames";
import React, { useEffect, useState } from "react";
import { useParticipationEventDetails } from "../../../../../../helpers/hooks/useParticipationEventDetails";
import { IParticipation } from "../../../../../../models/api/stardust/participation/IParticipation";
import { IParticipationEventAnswer } from "../../../../../../models/api/stardust/participation/IParticipationEventAnswer";
import { IParticipationEventQuestion } from "../../../../../../models/api/stardust/participation/IParticipationEventQuestion";
import Spinner from "../../../../Spinner";
import "./VotingEvent.scss";

interface VotingEventProps {
    participation: IParticipation;
}

const VotingEvent: React.FC<VotingEventProps> = ({ participation }) => {
    const [info, status, isLoading] = useParticipationEventDetails(participation.eventId);
    const [questions, setQuestions] = useState<IParticipationEventQuestion[]>([]);

    useEffect(() => {
        if (info?.payload.questions) {
            setQuestions(info?.payload.questions);
        }
    }, [info]);

    const getAnswer = (index: number, answers: IParticipationEventAnswer[]): React.ReactNode => {
        const answeredValue = participation?.answers ? participation.answers[index] : undefined;
        const answer = answers.find(a => a.value === answeredValue);
        return (
            <div className="field">
                <div className="card--label">
                    Answer
                </div>
                <div className="card--value">
                    {answer?.text ?? "--"}
                    <div className="card--header-info margin-0">
                        {answer?.additionalInfo}
                    </div>
                </div>
            </div>
        );
    };

    return (
        !isLoading ? (
            <div className="card voting-event">
                <div className="card--header">
                    <h3 className="card--header__title margin-b-t">
                        {info?.name}
                        <div
                            className={
                                classNames(
                                    "margin-l-t",
                                    "voting-event__status",
                                    { "voting-event__status--commencing":
                                        (status?.status === "commencing" || status?.status === "upcoming") },
                                    { "voting-event__status--holding": status?.status === "holding" },
                                    { "voting-event__status--ended": status?.status === "ended" }
                                )
                            }
                        >
                            {status?.status}
                        </div>
                    </h3>
                    <div className="card--header-info margin-0">
                        {info?.additionalInfo}
                    </div>
                </div>
                <div className="card--content">
                    {questions.map((question, idx) => (
                        <div key={idx} className="field">
                            <div className="card--label">
                                Question
                            </div>
                            <div className="card--value">
                                {question.text}
                                <div className="card--header-info margin-0">
                                    {question.additionalInfo}
                                </div>
                            </div>
                            {getAnswer(idx, question.answers)}
                        </div>
                    ))}
                </div>
            </div >
        ) :
            <div className="card voting-event">
                <Spinner />
            </div>
    );
};

export default VotingEvent;
