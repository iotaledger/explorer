import React from "react";
import { RouteComponentProps } from "react-router-dom";
import Output from "../../components/proto/Output";
import "./OutputPage.scss";

interface OutputPageProps {
    network: string;
    outputId: string;
}

const OutputPage: React.FC<RouteComponentProps<OutputPageProps>> = (
    { history, match: { params: { network, outputId } } }
) => (
    <div className="output-page">
        <div className="wrapper">
            <div className="inner">
                <div className="block--header row space-between">
                    <div className="row middle">
                        <h1>Output {outputId}</h1>
                    </div>
                </div>
                <div className="top">
                    <div className="sections">
                        <div className="section">
                            <div className="row row--tablet-responsive fill">
                                <div className="card col fill">
                                    <div key={outputId} className="transaction-from card--content">
                                        <Output
                                            key={outputId} outputId={outputId}
                                            network={network} isPreExpanded={true}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    );

export default OutputPage;
