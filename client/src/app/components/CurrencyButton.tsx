import React, { ReactNode } from "react";
import { Link } from "react-router-dom";
import Currency from "./Currency";
import "./CurrencyButton.scss";
import { CurrencyButtonProps } from "./CurrencyButtonProps";
import { CurrencyButtonState } from "./CurrencyButtonState";

/**
 * Component which will display a currency button.
 */
class CurrencyButton extends Currency<CurrencyButtonProps, CurrencyButtonState> {
    /**
     * Create a new instance of CurrencyButton.
     * @param props The props.
     */
    constructor(props: CurrencyButtonProps) {
        super(props);

        this.state = {
            currency: "USD",
            valueCurrency: "",
            priceCurrency: ""
        };
    }

    /**
     * The component was updated.
     * @param prevProps The previous properties.
     */
    public componentDidUpdate(prevProps: CurrencyButtonProps): void {
        if (this.props.value !== prevProps.value) {
            this.updateCurrency();
        }
    }

    /**
     * Render the component.
     * @returns The node to render.
     */
    public render(): ReactNode {
        const supportedFiatCurrencies = this._currencyService.getFiatCurrencies();

        return (
            <div className="currency-button">
                <div className="currency-button--label">
                    Conversion
                </div>
                <div className="currency-button--value">
                    {this.state.valueCurrency}
                </div>
                <div className="currency-button--selector">
                    <div className="rate--label">
                        Rate
                        <Link
                            to={this.props.marketsRoute}
                            className="rate--value"
                        >
                            {this.state.priceCurrency}
                        </Link>
                    </div>
                    <div className="select-wrapper select-wrapper--small">
                        <select
                            value={this.state.currency}
                            onChange={e => this.setCurrency(e.target.value)}
                        >
                            {supportedFiatCurrencies.map(cur => (
                                <option value={cur} key={cur}>{cur}</option>
                            ))}
                        </select>
                        <span className="material-icons">
                            expand_more
                        </span>
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
            this.setState({
                valueCurrency:
                    this._currencyService.convertIota(
                        this.props.value,
                        this._currencyData,
                        true,
                        2),
                priceCurrency: this._currencyData.baseCurrencyRate !== undefined
                    ? this._currencyService.convertFiatBase(
                        this._currencyData.baseCurrencyRate,
                        this._currencyData,
                        true,
                        3,
                        8)
                    : "--"
            });
        }
    }
}

export default CurrencyButton;
