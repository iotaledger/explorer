import React, { ReactNode } from "react";
import Currency from "./Currency";
import "./CurrencyButton.scss";
import { FiatValueProps } from "./FiatValueProps";
import { FiatValueState } from "./FiatValueState";
/**
 * Component which will display a currency button.
 */
class FiatValue extends Currency<FiatValueProps, FiatValueState> {
    /**
     * Create a new instance of CurrencyButton.
     * @param props The props.
     */
    constructor(props: FiatValueProps) {
        super(props);

        this.state = {
            valueCurrency: "",
            currency: "USD",
            currencies: []
        };
    }

    /**
     * Render the component.
     * @returns The node to render.
     */
    public render(): ReactNode {
        return (
            this.props.value !== 0 && (
                <span className={this.props.classNames}>
                    {this.state.valueCurrency}
                </span>
            )
        );
    }

    /**
     * Update formatted currencies.
     */
    protected updateCurrency(): void {
        if (this._currencyData && this.props.value) {
            this.setState({
                valueCurrency:
                    this._currencyService.convertIota(
                        this.props.value,
                        this._currencyData,
                        true,
                        2)
            });
        }
    }
}

export default FiatValue;
