import moment from "moment";
import React, { useEffect, useState } from "react";
import { RouteComponentProps } from "react-router";
import { ServiceFactory } from "../../../../factories/serviceFactory";
import { STARDUST } from "../../../../models/config/protocolVersion";
import { StardustApiClient } from "../../../../services/stardust/stardustApiClient";
import BarChart from "./BarChart";
import "./StatisticsPage.scss";

interface StatisticsPageProps {
    network: string;
}

const StatisticsPage: React.FC<RouteComponentProps<StatisticsPageProps>> = ({ match: { params: { network } } }) => {
    const [apiClient] = useState(
        ServiceFactory.get<StardustApiClient>(`api-client-${STARDUST}`)
    );
    const [data, setData] = useState<{ time: string; blocks: number }[] | null>(null);

    // const seenDays: number[] = [];
    // eslint-disable-next-line unicorn/no-array-reduce
    // const mockData = mockDataResponse.reduce((acc: { time: string; n: number }[], next) => {
    //     const m = moment(next.time);
    //     const dOY = m.dayOfYear();
    //     if (!seenDays.includes(dOY)) {
    //         acc.push(next);
    //         seenDays.push(dOY);
    //     }
    //     return acc;
    // }, []);

    useEffect(() => {
        apiClient.influxAnalytics({ network }).then(response => {
            if (!response.error) {
                // normalize data
                const update: { time: string; blocks: number }[] = response.blocksDaily.map(day => {
                    const blocks =
                        (day.milestone ?? 0) +
                        (day.transaction ?? 0) +
                        (day.noPayload ?? 0) +
                        (day.taggedData ?? 0);
                    return { time: moment(day.time).add(1, "minute").format("DD MMM"), blocks };
                });

                setData(update.slice(-7));
                console.log(response.blocksDaily);
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
                                <BarChart
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

