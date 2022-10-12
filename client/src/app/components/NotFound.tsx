import React from "react";
import "./NotFound.scss";

interface NotFoundProps {
    query: string;
    searchTarget: string;
}

const NotFound: React.FC<NotFoundProps> = ({ query, searchTarget }) => (
    <div className="not-found">
        <div className="wrapper">
            <div className="inner">
                <div className="card">
                    <div className="card--header">
                        <h2>Not found</h2>
                    </div>
                    <div className="card--content">
                        <p>
                            {`We could not find any ${searchTarget} with that query.`}
                        </p>
                        <br />
                        <div className="card--value">
                            <ul>
                                <li>
                                    <span>Query</span>
                                    <span>{query}</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

export default NotFound;

