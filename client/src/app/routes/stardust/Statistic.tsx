import { faker } from "@faker-js/faker";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Filler,
    Legend
} from "chart.js";
import "chartjs-plugin-zoom";
import React from "react";
import { Line } from "react-chartjs-2";
import { RouteComponentProps } from "react-router";
import "./Statistic.scss";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Filler,
    Legend
);

export const options = {
    responsive: true,
    plugins: {
            legend: {
            position: "top" as const
        }
    },
    zoom: {
        enabled: true,
        mode: "x",
    },
    pan: {
        enabled: true,
        mode: "x",
    }
};

const labels = ["January", "February", "March", "April", "May", "June", "July"];

export const data = {
    labels,
    datasets: [
        {
            fill: true,
            label: "Daily Transactions",
            data: labels.map(() => faker.datatype.number({ min: 0, max: 1000000 })),
            borderColor: "rgb(53, 162, 235)",
            backgroundColor: "rgba(53, 162, 235, 0.5)"
        }
    ]
};

const Statistic: React.FC<RouteComponentProps<undefined>> = () =>
    (
        <div className="foundry">
            <div className="wrapper">
                <div className="inner">
                    <div className="foundry--header">
                        <div className="row middle">
                            <h1>
                                Statistics
                            </h1>
                        </div>
                    </div>
                    <div className="section">
                        <Line options={options} data={data} />
                    </div>
                </div>
            </div>
        </div>
    );

export default Statistic;

