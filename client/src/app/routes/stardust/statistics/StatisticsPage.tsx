import moment from "moment";
import React, { useEffect, useState } from "react";
import { RouteComponentProps } from "react-router";
import { ServiceFactory } from "../../../../factories/serviceFactory";
import { STARDUST } from "../../../../models/config/protocolVersion";
import { StardustApiClient } from "../../../../services/stardust/stardustApiClient";
import StackedBarChart from "../../../components/stardust/statistics/StackedBarChart";
import "./StatisticsPage.scss";

interface StatisticsPageProps {
    network: string;
}

export interface BlocksDailyView {
    time: string;
    transaction: number | null;
    milestone: number | null;
    taggedData: number | null;
    noPayload: number | null;
}

const StatisticsPage: React.FC<RouteComponentProps<StatisticsPageProps>> = ({ match: { params: { network } } }) => {
    const [apiClient] = useState(
        ServiceFactory.get<StardustApiClient>(`api-client-${STARDUST}`)
    );
    const [data, setData] = useState<BlocksDailyView[] | null>(null);

    useEffect(() => {
        apiClient.influxAnalytics({ network }).then(response => {
            if (!response.error) {
                console.log("Influx response", response);
                const update = response.blocksDaily.map(day => (
                    { ...day, time: moment(day.time).add(1, "minute").format("DD MMM") }
                ));

                setData(update.slice(-7));
            } else {
                console.log("Fetching statistics failed", response.error);
            }
        }).catch(e => console.log("Influx analytics query failed", e));
    }, []);

    return (
        <div className="statistics-page">
            <div className="wrapper">
                <div className="inner">
                    <div className="statistics-page--header">
                        <div className="row middle">
                            <h1>
                                Statistics
                            </h1>
                        </div>
                    </div>
                    <div className="statistics-page--content">
                        <div className="section">
                            <div className="section--header">
                                <h2>Daily Blocks</h2>
                            </div>
                            {data && (
                                <StackedBarChart
                                    width={1172}
                                    height={550}
                                    data={data}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StatisticsPage;

