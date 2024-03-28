import { INodeInfoBaseToken } from "@iota/sdk-wasm-stardust/web";
import React, { ReactNode } from "react";
import Currency from "./Currency";
import { FiatValueProps } from "./FiatValueProps";
import { FiatValueState } from "./FiatValueState";
import NetworkContext from "../context/NetworkContext";
import "./CurrencyButton.scss";

/**
 * Component which will display a fiat value.
 */
class FiatValue extends Currency<FiatValueProps, FiatValueState> {
    /**
     * The component context type.
     */
    public static contextType = NetworkContext;

    /**
     * The component context.
     */
    public declare context: React.ContextType<typeof NetworkContext>;

    /**
     * Create a new instance of FiatValue.
     * @param props The props.
     */
    constructor(props: FiatValueProps) {
        super(props);

        this.state = {
            valueCurrency: "",
            currency: "USD",
        };
    }

    /**
     * The component was updated.
     * @param prevProps The previous properties.
     */
    public componentDidUpdate(prevProps: FiatValueProps): void {
        if (this.props.value !== prevProps.value) {
            this.updateCurrency();
        }
    }

    /**
     * Render the component.
     * @returns The node to render.
     */
    public render(): ReactNode {
        return <span className={this.props.classNames}>{this.state.valueCurrency}</span>;
    }

    /**
     * Update formatted currencies.
     */
    protected updateCurrency(): void {
        if (this._currencyData) {
            const tokenInfo: INodeInfoBaseToken = this.context.tokenInfo;

            const valueCurrency = tokenInfo.name
                ? this._currencyService.convertBaseToken(this.props.value, tokenInfo, this._currencyData, true, 2)
                : this._currencyService.convertIota(this.props.value, this._currencyData, true, 2);

            this.setState({ valueCurrency });
        }
    }
}

export default FiatValue;
