import React, { ReactNode } from "react";
import chevronDownGray from "../../assets/chevron-down-gray.svg";
import { CurrencyHelper } from "../../helpers/currencyHelper";
import Currency from "../components/Currency";
import "./CurrencyConverter.scss";
import { CurrencyConverterState } from "./CurrencyConverterState";

/**
 * Component for converting currency.
 */
class CurrencyConverter extends Currency<unknown, CurrencyConverterState> {
    /**
     * Multipliers for IOTA conversion
     */
    private readonly MULTIPLIERS: { [id: string]: number } = {
        i: 1000000,
        k: 1000,
        m: 1,
        g: 1 / 1000,
        t: 1 / 1000000,
        p: 1 / 1000000000
    };

    /**
     * Create a new instance of CurrencyConverter.
     * @param props The props.
     */
    constructor(props: unknown) {
        super(props);

        this.state = {
            fiat: CurrencyHelper.formatLocale(100),
            currency: "USD",
            currencies: [],
            currencyIota: "",
            currencyKiota: "",
            currencyGiota: "",
            currencyMiota: "",
            currencyTiota: "",
            currencyPiota: ""
        };
    }

    /**
     * Render the component.
     * @returns The node to render.
     */
    public render(): ReactNode {
        return (
            <div className="currency-converter">
                <div className="wrapper">
                    <div className="inner">
                        <h1>Currency Converter</h1>
                        <div className="card">
                            <div className="card--content">
                                <div className="card--label">
                                    Currency
                                </div>
                                <div className="card--value row row--tablet-responsive middle">
                                    <input
                                        type="text"
                                        value={this.state.fiat}
                                        className="margin-r-s"
                                        placeholder="Enter amount"
                                        onChange={e => this.setState({ fiat: e.target.value },
                                            () => this.fiatConversion())}
                                    />
                                    <div className="select-wrapper margin-t-t margin-b-t">
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
                                <div className="card--label card--label__no-case">
                                    Iotas (i)
                                </div>
                                <div className="card--value">
                                    <input
                                        type="text"
                                        value={this.state.currencyIota}
                                        onChange={e => this.setState(
                                            { currencyIota: e.target.value },
                                            () => this.iotaConversion("i", this.state.currencyIota))}
                                    />
                                </div>
                                <div className="card--label card--label__no-case">
                                    Kilo Iotas (Ki)
                                </div>
                                <div className="card--value">
                                    <input
                                        type="text"
                                        value={this.state.currencyKiota}
                                        onChange={e => this.setState(
                                            { currencyKiota: e.target.value },
                                            () => this.iotaConversion("k", this.state.currencyKiota))}
                                    />
                                </div>
                                <div className="card--label card--label__no-case">
                                    Mega Iotas (Mi)
                                </div>
                                <div className="card--value">
                                    <input
                                        type="text"
                                        value={this.state.currencyMiota}
                                        onChange={e => this.setState(
                                            { currencyMiota: e.target.value },
                                            () => this.iotaConversion("m", this.state.currencyMiota))}
                                    />
                                </div>
                                <div className="card--label card--label__no-case">
                                    Giga Iotas (Gi)
                                </div>
                                <div className="card--value">
                                    <input
                                        type="text"
                                        value={this.state.currencyGiota}
                                        onChange={e => this.setState(
                                            { currencyGiota: e.target.value },
                                            () => this.iotaConversion("g", this.state.currencyGiota))}
                                    />
                                </div>
                                <div className="card--label card--label__no-case">
                                    Tera Iotas (Ti)
                                </div>
                                <div className="card--value">
                                    <input
                                        type="text"
                                        value={this.state.currencyTiota}
                                        onChange={e => this.setState(
                                            { currencyTiota: e.target.value },
                                            () => this.iotaConversion("t", this.state.currencyTiota))}
                                    />
                                </div>
                                <div className="card--label card--label__no-case">
                                    Peta Iotas (Pi)
                                </div>
                                <div className="card--value">
                                    <input
                                        type="text"
                                        value={this.state.currencyPiota}
                                        onChange={e => this.setState(
                                            { currencyPiota: e.target.value },
                                            () => this.iotaConversion("p", this.state.currencyPiota))}
                                    />
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
        this.fiatConversion();
    }

    /**
     * Perform fiat conversion.
     */
    private fiatConversion(): void {
        const val = CurrencyHelper.parseLocale(this.state.fiat);
        if (!Number.isNaN(val) && this._currencyData) {
            const miota = this._currencyService.convertFiatToMiota(val, this._currencyData);

            this.setState({
                currencyIota: CurrencyHelper.formatLocale(Math.round(miota * this.MULTIPLIERS.i)),
                currencyKiota: CurrencyHelper.formatLocale(miota * this.MULTIPLIERS.k),
                currencyMiota: CurrencyHelper.formatLocale(miota),
                currencyGiota: CurrencyHelper.formatLocale(miota * this.MULTIPLIERS.g),
                currencyTiota: CurrencyHelper.formatLocale(miota * this.MULTIPLIERS.t),
                currencyPiota: CurrencyHelper.formatLocale(miota * this.MULTIPLIERS.p)
            });
        }
    }

    /**
     * Perform iota conversion with a multiplier.
     * @param unit The unit to use as base value.
     * @param value The value to convert.
     */
    private iotaConversion(unit: string, value: string): void {
        const val = CurrencyHelper.parseLocale(value);
        if (!Number.isNaN(val) && this._currencyData) {
            const miota = val / this.MULTIPLIERS[unit];
            const fiat = this._currencyService.convertMiotaToFiat(miota, this._currencyData);

            this.setState({
                fiat: CurrencyHelper.formatLocale(fiat),
                currencyIota: unit === "i"
                    ? value : CurrencyHelper.formatLocale(Math.round(miota * this.MULTIPLIERS.i)),
                currencyKiota: unit === "k" ? value : CurrencyHelper.formatLocale(miota * this.MULTIPLIERS.k),
                currencyMiota: unit === "m" ? value : CurrencyHelper.formatLocale(miota),
                currencyGiota: unit === "g" ? value : CurrencyHelper.formatLocale(miota * this.MULTIPLIERS.g),
                currencyTiota: unit === "t" ? value : CurrencyHelper.formatLocale(miota * this.MULTIPLIERS.t),
                currencyPiota: unit === "p" ? value : CurrencyHelper.formatLocale(miota * this.MULTIPLIERS.p)
            });
        }
    }
}

export default CurrencyConverter;
