/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-require-imports */
import Chartist, { IChartistLineChart, ILineChartOptions } from "chartist";
import classNames from "classnames";
import moment from "moment";
import React, { ReactNode } from "react";
import ChartistGraph from "react-chartist";
import chevronDownGray from "../../assets/chevron-down-gray.svg";
import { ServiceFactory } from "../../factories/serviceFactory";
import { ApiClient } from "../../services/apiClient";
import Currency from "../components/Currency";
import Spinner from "../components/Spinner";
import "./Markets.scss";
import { MarketsState } from "./MarketsState";

/**
 * Component which will show the markets page.
 */
class Markets extends Currency<unknown, MarketsState> {
    /**
     * The api client.
     */
    private readonly _apiClient: ApiClient;

    /**
     * Create a new instance of Transaction.
     * @param props The props.
     */
    constructor(props: unknown) {
        super(props);

        this._apiClient = ServiceFactory.get<ApiClient>("api-client");

        this.state = {
            statusBusy: true,
            currencies: [],
            currency: "USD",
            prices: [],
            selectedRange: "all",
            ranges: [
                {
                    value: "all",
                    label: "All"
                },
                {
                    value: "lastyear",
                    label: "Last Year"
                },
                {
                    value: "last6months",
                    label: "Last 6 Months"
                },
                {
                    value: "last90days",
                    label: "Last 90 Days"
                },
                {
                    value: "last30days",
                    label: "Last 30 Days"
                },
                {
                    value: "last14days",
                    label: "Last 14 Days"
                },
                {
                    value: "last7days",
                    label: "Last 7 Days"
                }
            ],
            marketCapEUR: 0,
            marketCapCurrency: "--",
            priceEUR: 0,
            priceCurrency: "--"
        };
    }

    /**
     * Display a hover tooltip.
     * @param currency The current currency.
     * @returns The plugin.
     */
    private static pointLabels(currency: string): (chart: IChartistLineChart) => void {
        return (chart: IChartistLineChart) => {
            const horiz = document.querySelectorAll(".crosshair-h")[0] as HTMLElement;
            const vert = document.querySelectorAll(".crosshair-v")[0] as HTMLElement;
            const tt = document.querySelectorAll(".tooltip")[0];

            const points: {
                type: string;
                x: number;
                y: number;
                value: {
                    x: number;
                    y: number;
                };
            }[] = [];

            chart.on("draw", (data: {
                type: string;
                x: number;
                y: number;
                value: {
                    x: number;
                    y: number;
                };
            }) => {
                if (data.type === "point") {
                    points.push(data);
                }
            });

            chart.container.addEventListener("mousemove", (event: MouseEvent) => {
                horiz.style.width = `${chart.container.clientWidth}px`;
                horiz.style.top = `${event.pageY}px`;
                vert.style.height = `${chart.container.clientHeight}px`;
                vert.style.left = `${event.pageX}px`;

                const startX = event.offsetX - 50;
                const startY = event.offsetY;
                const pixelLastX = points[points.length - 1].x;
                const pixelFirstX = points[0].x;

                let inside = false;
                if (startX >= 0 && startX < pixelLastX - 45 && startY >= 15 && startY < 270) {
                    inside = true;
                    vert.style.display = "block";
                    horiz.style.display = "block";
                } else {
                    vert.style.display = "none";
                    horiz.style.display = "none";
                }

                let hit;
                if (inside && startX >= 0 && startX < pixelLastX - 45) {
                    for (let i = 0; i < points.length; i++) {
                        if (startX > (points[i].x - pixelFirstX)) {
                            hit = i;
                        } else if (hit !== undefined) {
                            break;
                        }
                    }
                }

                if (hit !== undefined) {
                    tt.className = "tooltip";
                    tt.innerHTML = `${moment(points[hit].value.x * 1000).format("LL")
                        }<br/>${points[hit].value.y.toFixed(3)} ${currency}`;
                } else {
                    tt.className = "tooltip hidden";
                }
            });
        };
    }

    /**
     * Render the component.
     * @returns The node to render.
     */
    public render(): ReactNode {
        const options: ILineChartOptions = {
            fullWidth: true,
            showArea: true,
            low: 0,
            showPoint: true,
            axisX: {
                type: Chartist.FixedScaleAxis,
                divisor: 10,
                labelInterpolationFnc: (value: number) => moment(value * 1000).format("MMM DD YYYY")
            },
            axisY: {
                type: Chartist.AutoScaleAxis
            },
            plugins: [Markets.pointLabels(this.state.currency)]
        };

        const data = {
            series: [this.state.range ?? this.state.prices]
        };

        return (
            <div className="markets">
                <div className="wrapper">
                    <div className="inner">
                        <h1>
                            Markets
                        </h1>
                        <div className="row top">
                            <div className="cards">
                                <div className="card margin-b-s">
                                    <div className="card--header card--header__space-between">
                                        <h2>Current Market</h2>
                                        <div className="select-wrapper select-wrapper--small">
                                            <select
                                                value={this.state.currency}
                                                onChange={e => this.setCurrency(e.target.value)}
                                            >
                                                {this.state.currencies.map(cur => (
                                                    <option value={cur} key={cur}>{cur}</option>
                                                ))}
                                            </select>
                                            <img src={chevronDownGray} alt="expand" />
                                        </div>
                                    </div>
                                    <div className="card--content">
                                        <div className="row">
                                            <div className="col fill">
                                                <div className="card--label">
                                                    Market Cap
                                                </div>
                                                <div className="card--value">
                                                    {this.state.marketCapCurrency}
                                                </div>
                                            </div>
                                            <div className="col fill">
                                                <div className="card--label">
                                                    Price
                                                </div>
                                                <div className="card--value">
                                                    {this.state.priceCurrency}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="card">
                                    <div className="card--header card--header__space-between">
                                        <h2>Price History</h2>
                                        <div className="select-wrapper select-wrapper--small">
                                            <select
                                                value={this.state.currency}
                                                onChange={e => this.setCurrency(e.target.value)}
                                            >
                                                {this.state.currencies.map(cur => (
                                                    <option value={cur} key={cur}>{cur}</option>
                                                ))}
                                            </select>
                                            <img src={chevronDownGray} alt="expand" />
                                        </div>
                                    </div>
                                    <div className="card--content">
                                        {this.state.statusBusy && (<Spinner />)}
                                        {!this.state.statusBusy && (
                                            <React.Fragment>
                                                <div className="row">
                                                    {this.state.ranges.map(range => (
                                                        <button
                                                            key={range.value}
                                                            type="button"
                                                            className={classNames(
                                                                "button button--small margin-r-t",
                                                                {
                                                                    "button--secondary":
                                                                        this.state.selectedRange !== range.value
                                                                }
                                                            )}
                                                            onClick={() => this.setRange(range.value)}
                                                        >
                                                            {range.label}
                                                        </button>
                                                    ))}
                                                </div>
                                                <svg width="0" height="0">
                                                    <defs>
                                                        <linearGradient id="gradient-a" gradientTransform="rotate(90)">
                                                            <stop offset="0%" stopColor="#20F381" stopOpacity="1" />
                                                            <stop offset="100%" stopColor="#20F381" stopOpacity="0" />
                                                        </linearGradient>
                                                    </defs>
                                                </svg>
                                                <div className="tooltip-container">
                                                    <div className="tooltip hidden" />
                                                </div>
                                                <div className="line-container">
                                                    <div className="crosshair-h hidden" />
                                                    <div className="crosshair-v hidden" />
                                                    <ChartistGraph
                                                        data={data}
                                                        options={options}
                                                        type="Line"
                                                    />
                                                </div>
                                            </React.Fragment>
                                        )}

                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    /**
     * Update formatted currencies.
     */
    protected updateCurrency(): void {
        if (this._currencyData) {
            this.setState(
                {
                    statusBusy: true,
                    marketCapCurrency:
                        this._currencyData.marketCap !== undefined
                            ? this._currencyService.convertFiatBase(
                                this._currencyData.marketCap,
                                this._currencyData,
                                true,
                                0)
                            : "--",
                    priceCurrency: this._currencyData.baseCurrencyRate !== undefined
                        ? this._currencyService.convertFiatBase(
                            this._currencyData.baseCurrencyRate,
                            this._currencyData,
                            true,
                            2)
                        : "--"
                },
                async () => {
                    const markets = await this._apiClient.marketGet({
                        currency: this.state.currency
                    });

                    if (markets.success && markets.data) {
                        this.setState({
                            statusBusy: false,
                            prices: markets.data.map(m => (
                                {
                                    x: moment(m.d).unix(),
                                    y: m.p,
                                    meta: {
                                        x: moment(m.d).unix()
                                    }
                                }
                            ))
                        });
                    } else {
                        this.setState({ statusBusy: false });
                    }
                }
            );
        }
    }

    /**
     * Set the range for display.
     * @param range The range.
     */
    private setRange(range: string): void {
        if (range === "last7days") {
            this.setState({ range: this.state.prices.slice(-7), selectedRange: range });
        } else if (range === "last14days") {
            this.setState({ range: this.state.prices.slice(-14), selectedRange: range });
        } else if (range === "last90days") {
            this.setState({ range: this.state.prices.slice(-90), selectedRange: range });
        } else if (range === "last30days") {
            this.setState({ range: this.state.prices.slice(-30), selectedRange: range });
        } else if (range === "last6months") {
            this.setState({ range: this.state.prices.slice(-133), selectedRange: range });
        } else if (range === "lastyear") {
            this.setState({ range: this.state.prices.slice(-365), selectedRange: range });
        } else {
            this.setState({ range: undefined, selectedRange: "all" });
        }
    }
}

export default Markets;
