import moment from "moment";
import React from "react";
import { response } from "../../../../helpers/stardust/mockDailyTransactions";
import BarChart from "./BarChart";
import "./StatisticsPage.scss";

const StatisticsPage: React.FC<null> = () => {
    const seenDays: number[] = [];

    // eslint-disable-next-line unicorn/no-array-reduce
    const data = response.reduce((acc: { time: string; n: number }[], next) => {
        const m = moment(next.time);
        const dOY = m.dayOfYear();
        if (!seenDays.includes(dOY)) {
            acc.push(next);
            seenDays.push(dOY);
        }
        return acc;
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
                                <h2>Random</h2>
                            </div>
                            <BarChart
                                width={1172}
                                height={550}
                                data={data}
                            />
                            <div className="row middle space-between">
                                <BarChart
                                    width={566}
                                    height={550}
                                    data={data}
                                />
                                <BarChart
                                    width={566}
                                    height={550}
                                    data={data}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StatisticsPage;

