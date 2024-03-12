import React from "react";
import { RouteComponentProps } from "react-router";
import { InfluxChartsTab } from "../../../components/nova/statistics/InfluxChartsTab";
import "./StatisticsPage.scss";

interface StatisticsPageProps {
    network: string;
}

const StatisticsPage: React.FC<RouteComponentProps<StatisticsPageProps>> = () => (
    <div className="statistics-page">
        <div className="wrapper">
            <div className="inner">
                <div className="statistics-page--header">
                    <div className="row middle">
                        <h1>Statistics</h1>
                    </div>
                </div>
                <InfluxChartsTab />
            </div>
        </div>
    </div>
);

export default StatisticsPage;
