import { ServiceFactory } from "../../factories/serviceFactory";
import { ICurrencySettings } from "../../models/services/ICurrencySettings";
import { CurrencyService } from "../../services/currencyService";
import { SettingsService } from "../../services/settingsService";
import AsyncComponent from "../components/AsyncComponent";
import { CurrencyState } from "./CurrencyState";

/**
 * Component which will provide facilities for a component with currencies.
 */
abstract class Currency<P, S extends CurrencyState> extends AsyncComponent<P, S> {
    /**
     * The settings service.
     */
    protected readonly _settingsService: SettingsService;

    /**
     * The currency service.
     */
    protected readonly _currencyService: CurrencyService;

    /**
     * The currency data.
     */
    protected _currencyData?: ICurrencySettings;

    /**
     * Subscription id for currency updates.
     */
    protected _subscriptionId?: string;

    /**
     * Create a new instance of Currency.
     * @param props The props.
     */
    constructor(props: P) {
        super(props);

        this._currencyService = ServiceFactory.get<CurrencyService>("currency");
        this._settingsService = ServiceFactory.get<SettingsService>("settings");
    }

    /**
     * The component mounted.
     */
    public componentDidMount(): void {
        super.componentDidMount();

        this.buildCurrency();

        this._subscriptionId = this._currencyService.subscribe(() => {
            const currency = this._currencyService.getSettingsFiatCode();
            if (this._currencyData && currency) {
                this._currencyData.fiatCode = currency;
                this.setState(
                    {
                        currency
                    },
                    () => {
                        this.updateCurrency();
                    });
            }
        });
    }

    /**
     * The component will unmount so unsubscribe from currency service.
     */
    public componentWillUnmount(): void {
        super.componentWillUnmount();
        if (this._subscriptionId) {
            this._currencyService.unsubscribe(this._subscriptionId);
            this._subscriptionId = undefined;
        }
    }

    /**
     * Set a new currency.
     * @param currency The currency to set.
     */
    protected setCurrency(currency: string): void {
        if (this._currencyData) {
            this._currencyData.fiatCode = currency;
            this._currencyService.saveFiatCode(currency);
            this.setState(
                {
                    currency
                },
                () => {
                    this.updateCurrency();
                });
        }
    }

    /**
     * Build the currency information.
     */
    private buildCurrency(): void {
        this._currencyService.loadCurrencies((isAvailable, currencyData, err) => {
            if (isAvailable && currencyData && this._isMounted) {
                this._currencyData = currencyData;

                this.setState(
                    {
                        currency: this._currencyData.fiatCode,
                        currencies: (this._currencyData.currencies ?? []).map(c => c.id)
                    },
                    () => this.updateCurrency());
            }
        });
    }

    /**
     * Update formatted currencies.
     */
    protected abstract updateCurrency(): void;
}

export default Currency;
