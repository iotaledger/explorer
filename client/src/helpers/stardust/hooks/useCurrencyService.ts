import { useEffect, useState } from "react";
import { useIsMounted } from "~helpers/hooks/useIsMounted";
import { ServiceFactory } from "~factories/serviceFactory";
import { ICurrencySettings } from "~models/services/ICurrencySettings";
import { CurrencyService } from "~services/currencyService";

/**
 * Hook into Currency Service
 * @param isIota Is the base currency Iota.
 * @returns The current currency and currecny data.
 */
export function useCurrencyService(isIota: boolean): [string, string] {
    const isMounted = useIsMounted();
    const [currencyService] = useState(ServiceFactory.get<CurrencyService>("currency"));
    const [currencyData, setCurrencyData] = useState<ICurrencySettings | null>(null);
    const [subscriptionId, setSubscriptionId] = useState<string | null>(null);
    const [currency, setCurrency] = useState<string>("EUR");
    const [marketCap, setMarketCap] = useState<string>("--");
    const [price, setPrice] = useState<string>("--");

    useEffect(() => {
        const data = buildCurrency();

        const newSubscriptionId = currencyService.subscribe(() => {
            const currencyFromSettings = currencyService.getSettingsFiatCode();
            if (data && currencyFromSettings) {
                data.fiatCode = currencyFromSettings;
                setCurrency(currencyFromSettings);
                setCurrencyData(data);
            }
        });

        setSubscriptionId(newSubscriptionId);

        return () => {
            if (subscriptionId) {
                currencyService.unsubscribe(subscriptionId);
                setSubscriptionId(null);
            }
        };
    }, [currencyService]);

    const buildCurrency = (): ICurrencySettings | null => {
        let result = null;
        currencyService.loadCurrencies((isAvailable, theCurrencyData) => {
            if (isAvailable && theCurrencyData && isMounted) {
                setCurrencyData(theCurrencyData);
                setCurrency(theCurrencyData.fiatCode);

                result = theCurrencyData;
            }
        });

        return result;
    };

    useEffect(() => {
        if (currencyData) {
            const coinPrice = isIota ? currencyData?.coinStats?.iota.price : currencyData?.coinStats?.shimmer.price;
            const coinMarketCap = isIota ? currencyData?.coinStats?.iota.marketCap : currencyData?.coinStats?.shimmer.marketCap;

            setMarketCap(coinMarketCap ? currencyService.convertFiatBase(coinMarketCap, currencyData, true, 2, undefined, true) : "--");
            setPrice(coinPrice ? currencyService.convertFiatBase(coinPrice, currencyData, true, 3, 8) : "--");
        }
    }, [isIota, currency, currencyData]);

    return [price, marketCap];
}
