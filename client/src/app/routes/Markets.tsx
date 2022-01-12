/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-require-imports */
import Chartist, { IBarChartOptions, IChartistLineChart, ILineChartOptions, IChartistBarChart } from "chartist";
import classNames from "classnames";
import moment from "moment";
import React, { ReactNode } from "react";
import ChartistGraph from "react-chartist";
import chevronDownGray from "../../assets/chevron-down-gray.svg";
import { ServiceFactory } from "../../factories/serviceFactory";
import { DateHelper } from "../../helpers/dateHelper";
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
     * Point data for the charts.
     */
    private readonly _points: {
        x: number;
        y: number;
        value: {
            x: number;
            y: number;
        };
    }[][];

    /**
     * Create a new instance of Transaction.
     * @param props The props.
     */
    constructor(props: unknown) {
        super(props);

        this._apiClient = ServiceFactory.get<ApiClient>("api-client");

        this._points = [];

        this.state = {
            statusBusy: true,
            currencies: [],
            currency: "USD",
            prices: [],
            dayPrices: [],
            volumes: [],
            dayVolumes: [],
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
                },
                {
                    value: "24hours",
                    label: "24 Hours"
                },
                {
                    value: "1hour",
                    label: "1 Hour"
                }
            ],
            marketCapCurrency: "--",
            priceCurrency: "--",
            priceAllTimeHigh: "--",
            priceAllTimeLow: "--",
            volumeAllTimeHigh: "--",
            volumeAllTimeLow: "--"
        };
    }

    /**
     * The component mounted.
     */
    public async componentDidMount(): Promise<void> {
        super.componentDidMount();

        window.scrollTo({
            left: 0,
            top: 0,
            behavior: "smooth"
        });
    }

    /**
     * Render the component.
     * @returns The node to render.
     */
    public render(): ReactNode {
        const priceChartOptions: ILineChartOptions = {
            fullWidth: true,
            showArea: true,
            low: 0,
            showPoint: true,
            axisX: {
                type: Chartist.FixedScaleAxis,
                divisor: 10,
                labelInterpolationFnc: (value: number) => (
                    this.state.selectedRange === "1hour"
                        ? moment(value * 1000).format("mm")
                        : (this.state.selectedRange === "24hours"
                            ? moment(value * 1000).format("HH:mm")
                            : moment(value * 1000).format("DD MMM YY")))
            },
            axisY: {
                type: Chartist.AutoScaleAxis
            },
            plugins: [this.pointLabels(0, 3)]
        };

        const volumeChartOptions: unknown = {
            low: 0,
            axisX: {
                type: Chartist.FixedScaleAxis,
                divisor: 10,
                labelInterpolationFnc: (value: number) => (
                    this.state.selectedRange === "1hour"
                        ? moment(value * 1000).format("mm")
                        : (this.state.selectedRange === "24hours"
                            ? moment(value * 1000).format("HH:mm")
                            : moment(value * 1000).format("DD MMM YY")))
            },
            axisY: {
                type: Chartist.AutoScaleAxis,
                labelInterpolationFnc: (value: number) => `${value / 1000000}M`
            },
            plugins: [this.pointLabels(1, 0)]
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
                                        <div
                                            className="select-wrapper select-wrapper--card-header select-wrapper--small"
                                        >
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
                                                <div className="card--value card--value__highlight">
                                                    {this.state.priceCurrency}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col fill">
                                                <div className="card--label">
                                                    Price All Time High
                                                </div>
                                                <div className="card--value">
                                                    {this.state.priceAllTimeHigh}
                                                </div>
                                            </div>
                                            <div className="col fill">
                                                <div className="card--label">
                                                    Price All Time Low
                                                </div>
                                                <div className="card--value">
                                                    {this.state.priceAllTimeLow}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col fill">
                                                <div className="card--label">
                                                    Volume All Time High
                                                </div>
                                                <div className="card--value">
                                                    {this.state.volumeAllTimeHigh}
                                                </div>
                                            </div>
                                            <div className="col fill">
                                                <div className="card--label">
                                                    Volume All Time Low
                                                </div>
                                                <div className="card--value">
                                                    {this.state.volumeAllTimeLow}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="card">
                                    <div className="card--header card--header__space-between">
                                        <h2>Price and Volume History</h2>
                                        <div
                                            className="select-wrapper select-wrapper--card-header select-wrapper--small"
                                        >
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
                                                <div className="row wrap">
                                                    {this.state.ranges.map(range => (
                                                        <button
                                                            key={range.value}
                                                            type="button"
                                                            className={classNames(
                                                                "date-links margin-r-t margin-b-t",
                                                                {
                                                                    "date-links--secondary":
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
                                                        data={{
                                                            series: [this.state.pricesRange ?? this.state.prices]
                                                        }}
                                                        options={priceChartOptions}
                                                        type="Line"
                                                    />
                                                </div>
                                                <div className="tooltip-container">
                                                    <div className="tooltip hidden" />
                                                </div>
                                                <div className="bar-container">
                                                    <div className="crosshair-h hidden" />
                                                    <div className="crosshair-v hidden" />
                                                    <ChartistGraph
                                                        data={{
                                                            series: [this.state.volumesRange ?? this.state.volumes]
                                                        }}
                                                        options={volumeChartOptions as IBarChartOptions}
                                                        type="Bar"
                                                    />
                                                </div>
                                            </React.Fragment>
                                        )}
                                        <p className="data-source">
                                            <span className="margin-r-t">All data is sourced from</span>
                                            <a
                                                href="https://www.coingecko.com/en/coins/iota"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                CoinGecko
                                            </a>
                                        </p>
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
                            3,
                            8)
                        : "--"
                },
                async () => {
                    const markets = await this._apiClient.marketGet({
                        currency: this.state.currency.toLowerCase()
                    });

                    if (markets.data && markets.day) {
                        let maxPrice = 0;
                        let maxPriceDate = 0;
                        let minPrice = Number.MAX_VALUE;
                        let minPriceDate = 0;
                        let maxVolume = 0;
                        let maxVolumeDate = 0;
                        let minVolume = Number.MAX_VALUE;
                        let minVolumeDate = 0;
                        for (const data of markets.data) {
                            if (data.p > maxPrice) {
                                maxPrice = data.p;
                                maxPriceDate = new Date(data.d).getTime();
                            }
                            if (data.p < minPrice) {
                                minPrice = data.p;
                                minPriceDate = new Date(data.d).getTime();
                            }
                            if (data.v > maxVolume) {
                                maxVolume = data.v;
                                maxVolumeDate = new Date(data.d).getTime();
                            }
                            if (data.v < minVolume) {
                                minVolume = data.v;
                                minVolumeDate = new Date(data.d).getTime();
                            }
                        }
                        this.setState({
                            statusBusy: false,
                            prices: markets.data.map(m => (
                                {
                                    x: moment(m.d).unix(),
                                    y: m.p
                                }
                            )),
                            volumes: markets.data.map(m => (
                                {
                                    x: moment(m.d).unix(),
                                    y: m.v
                                }
                            )),
                            dayPrices: markets.day.map(m => ({
                                x: m.t / 1000,
                                y: m.p
                            })),
                            dayVolumes: markets.day.map(m => ({
                                x: m.t / 1000,
                                y: m.v
                            })),
                            priceAllTimeHigh:
                                `${this._currencyService.formatCurrency(this._currencyData, maxPrice, 3, 8)
                                } on ${DateHelper.formatNoTime(maxPriceDate)
                                }`,
                            priceAllTimeLow:
                                `${this._currencyService.formatCurrency(this._currencyData, minPrice, 3, 8)
                                } on ${DateHelper.formatNoTime(minPriceDate)
                                }`,
                            volumeAllTimeHigh:
                                `${this._currencyService.formatCurrency(this._currencyData, maxVolume, 0)
                                } on ${DateHelper.formatNoTime(maxVolumeDate)
                                }`,
                            volumeAllTimeLow:
                                `${this._currencyService.formatCurrency(this._currencyData, minVolume, 0)
                                } on ${DateHelper.formatNoTime(minVolumeDate)
                                }`
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
        if (range === "24hours") {
            this.setState({
                selectedRange: range,
                pricesRange: this.state.dayPrices,
                volumesRange: this.state.dayVolumes
            });
        } else if (range === "1hour") {
            const hourAgo = this.state.dayPrices[this.state.dayPrices.length - 1].x - (60 * 60);
            this.setState({
                selectedRange: range,
                pricesRange: this.state.dayPrices.filter(t => t.x > hourAgo),
                volumesRange: this.state.dayVolumes.filter(t => t.x > hourAgo)
            });
        } else if (range === "last7days") {
            this.setState({
                selectedRange: range,
                pricesRange: this.state.prices.slice(-7),
                volumesRange: this.state.volumes.slice(-7)
            });
        } else if (range === "last14days") {
            this.setState({
                selectedRange: range,
                pricesRange: this.state.prices.slice(-14),
                volumesRange: this.state.volumes.slice(-14)
            });
        } else if (range === "last90days") {
            this.setState({
                selectedRange: range,
                pricesRange: this.state.prices.slice(-90),
                volumesRange: this.state.volumes.slice(-90)
            });
        } else if (range === "last30days") {
            this.setState({
                selectedRange: range,
                pricesRange: this.state.prices.slice(-30),
                volumesRange: this.state.volumes.slice(-30)
            });
        } else if (range === "last6months") {
            this.setState({
                selectedRange: range,
                pricesRange: this.state.prices.slice(-133),
                volumesRange: this.state.volumes.slice(-133)
            });
        } else if (range === "lastyear") {
            this.setState({
                selectedRange: range,
                pricesRange: this.state.prices.slice(-365),
                volumesRange: this.state.volumes.slice(-365)
            });
        } else {
            this.setState({
                selectedRange: range,
                pricesRange: undefined,
                volumesRange: undefined
            });
        }
    }

    /**
     * Display a hover tooltip.
     * @param chartIndex The tool tip index to populate.
     * @param decimalPlaces The decimal places for the currency.
     * @param maxDecimalPlaces The max decimal places to show.
     * @returns The plugin.
     */
    private pointLabels(chartIndex: number, decimalPlaces: number, maxDecimalPlaces?: number):
        (chart: IChartistLineChart | IChartistBarChart) => void {
        return (chart: IChartistLineChart | IChartistBarChart) => {
            const horizs = document.querySelectorAll(".crosshair-h");
            const verts = document.querySelectorAll(".crosshair-v");
            const toolTips = document.querySelectorAll(".tooltip");

            chart.on("draw", (data: {
                type: string;
                x: number;
                y: number;
                x1: number;
                y1: number;
                x2: number;
                y2: number;
                value: {
                    x: number;
                    y: number;
                };
                element: {
                    _node: HTMLElement;
                };
            }) => {
                if (data.type === "grid") {
                    this._points[chartIndex] = [];
                } else if (data.type === "point") {
                    this._points[chartIndex].push({
                        x: data.x,
                        y: data.y,
                        value: {
                            x: data.value.x,
                            y: data.value.y
                        }
                    });
                } else if (data.type === "bar") {
                    this._points[chartIndex].push({
                        x: (data.x1 + data.x2) / 2,
                        y: (data.y1 + data.y2) / 2,
                        value: {
                            x: data.value.x,
                            y: data.value.y
                        }
                    });
                }
            });

            chart.container.addEventListener("mousemove", (event: MouseEvent) => {
                if (this._points[chartIndex].length > 0) {
                    const currentHoriz = horizs[chartIndex] as HTMLElement;
                    const currentVert = verts[chartIndex] as HTMLElement;
                    currentHoriz.style.width = `${chart.container.clientWidth}px`;
                    currentHoriz.style.top = `${event.pageY}px`;
                    currentVert.style.height = `${chart.container.clientHeight}px`;
                    currentVert.style.left = `${event.pageX}px`;

                    const startX = event.offsetX - 50;
                    const startY = event.offsetY;
                    const pixelLastX = this._points[chartIndex][this._points[chartIndex].length - 1].x;
                    const pixelFirstX = this._points[chartIndex][0].x;

                    let inside = false;
                    if (startX >= 0 && startX < pixelLastX - 45 && startY >= 15 && startY < 270) {
                        inside = true;
                        currentVert.style.display = "block";
                        currentHoriz.style.display = "block";
                    } else {
                        currentVert.style.display = "none";
                        currentHoriz.style.display = "none";
                    }
                    const otherChartIndex = chartIndex === 0 ? 1 : 0;
                    (horizs[otherChartIndex] as HTMLElement).style.display = "none";
                    (verts[otherChartIndex] as HTMLElement).style.display = "none";

                    let hit;
                    if (inside && startX >= 0 && startX < pixelLastX - 45) {
                        for (let i = 0; i < this._points[chartIndex].length; i++) {
                            if (startX > (this._points[chartIndex][i].x - pixelFirstX)) {
                                hit = i;
                            } else if (hit !== undefined) {
                                break;
                            }
                        }
                    }

                    if (hit !== undefined) {
                        toolTips[chartIndex].className = "tooltip";
                        toolTips[chartIndex].innerHTML = `${moment(this._points[chartIndex][hit].value.x * 1000)
                            .format(this.state.selectedRange === "1hour" ? "HH:mm:ss"
                                : (this.state.selectedRange === "24hours" ? "HH:mm" : "LL"))
                            }<br/>${this._currencyService.formatCurrency(
                                this._currencyData,
                                this._points[chartIndex][hit].value.y, decimalPlaces, maxDecimalPlaces)}`;
                    } else {
                        toolTips[chartIndex].className = "tooltip hidden";
                    }
                    toolTips[otherChartIndex].className = "tooltip hidden";
                }
            });
        };
    }
}

export default Markets;
