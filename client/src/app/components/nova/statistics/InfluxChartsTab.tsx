import React from "react";
import graphMessages from "~assets/modals/stardust/statistics/graphs.json";
import { useChartsState } from "~helpers/nova/hooks/useChartsState";
import { idGenerator } from "~helpers/stardust/statisticsUtils";
import Modal from "../../Modal";
import StackedLineChart from "../../stardust/statistics/charts/StackedLineChart";

export const InfluxChartsTab: React.FC = () => {
    const { dailyBlocks } = useChartsState();

    const ids = idGenerator();

    return (
        <div className="statistics-page--charts">
            <div className="section">
                <div className="section--header">
                    <h2>Blocks</h2>
                    <Modal icon="info" data={graphMessages.blocks} />
                </div>
                <div className="row statistics-row">
                    <StackedLineChart
                        chartId={ids.next().value}
                        title="Daily Blocks"
                        info={graphMessages.dailyBlocks}
                        subgroups={["transaction", "validation", "taggedData", "candidacy", "noPayload"]}
                        groupLabels={["Transaction", "Validation", "Tagged Data", "Candidacy announcement", "No payload"]}
                        colors={["#4140DF", "#14CABF", "#36A1AC", "#99BEE1", "#186575"]}
                        data={dailyBlocks}
                    />
                </div>
            </div>
        </div>
    );
};
