/* eslint-disable prefer-template */
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
import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import { RouteComponentProps } from "react-router";
import { response } from "../../../helpers/stardust/mockDailyTransactions";
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

const Statistic: React.FC<RouteComponentProps<undefined>> = () => {
    const [labels, setLabels] = useState<string[]>();
    const [transactions, setTransactions] = useState<number[]>();

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    const options = {
        responsive: true,
        scales: {
            x: {
                ticks: {
                    autoSkip: true,
                    maxTicksLimit: 3
                    // this function can also be used to display selective labels.
                    // callback: function(tickValue: string | number, index: number) {
                    //     return index % 60 === 0 && labels ? labels[Number(tickValue)] : '';
                    // }
                }
            }
        },
        pan: {
            enabled: true,
            mode: "y"
          },
          zoom: {
            enabled: true,
            mode: "x"
        },
        plugins: {
            legend: {
                position: "top" as const
            }
        }
    };

    const data = {
        labels,
        datasets: [
            {
                fill: true,
                label: "Daily Transactions",
                data: transactions,
                borderColor: "rgb(53, 162, 235)",
                backgroundColor: "rgba(53, 162, 235, 0.5)"
            }
        ]
    };

    useEffect(() => {
        const allLabels = [];
        const allTransactions = [];
        for (let i = 0; i < response.length; i++) {
            const transaction = response[i];
            const date = new Date(transaction.updatedDate.replace(" ", "T") + "Z");
            allLabels.push(monthNames[date.getMonth()]);
            allTransactions.push(transaction.transactions);
        }
        setLabels(allLabels);
        setTransactions(allTransactions);
    }, []);

    return (
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
};

export default Statistic;

