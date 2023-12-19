import React from "react";
import { RouteComponentProps } from "react-router-dom";
import NotFound from "~/app/components/NotFound";
import { useOutputDetails } from "~/helpers/nova/hooks/useOutputDetails";

interface OutputPageProps {
    /**
     * The network to lookup.
     */
    network: string;

    /**
     * The output id to lookup.
     */
    outputId: string;
}

const OutputPage: React.FC<RouteComponentProps<OutputPageProps>> = ({
    match: {
        params: { network, outputId },
    },
}) => {
    const [output, , , outputError] = useOutputDetails(network, outputId);

    if (outputError) {
        return (
            <div className="output-page">
                <div className="wrapper">
                    <div className="inner">
                        <div className="output-page--header">
                            <div className="row middle">
                                <h1>Output</h1>
                            </div>
                        </div>
                        <NotFound searchTarget="output" query={outputId} />
                    </div>
                </div>
            </div>
        );
    }

    return <div>Ze output {JSON.stringify(output)}</div>;
};

export default OutputPage;
