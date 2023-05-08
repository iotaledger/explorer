import { useEffect, useState } from "react";
import { ServiceFactory } from "../../factories/serviceFactory";
import { ICurrencySettings } from "../../models/services/ICurrencySettings";
import { CurrencyService } from "../../services/currencyService";
import { useIsMounted } from "./useIsMounted";

/**
 * Hook into Currency Service
 * @returns The current currency and currecny data.
 */
export function useCurrencyService(): [
    string,
    string
] {
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
            setMarketCap(
                currencyData.coinStats?.shimmer?.marketCap ?
                    currencyService.convertFiatBase(
                        currencyData.coinStats.shimmer.marketCap,
                        currencyData,
                        true,
                        2,
                        undefined,
                        true
                    ) : "--"
            );
            setPrice(
                currencyData.coinStats?.shimmer?.price ?
                    currencyService.convertFiatBase(
                        currencyData.coinStats.shimmer.price,
                        currencyData,
                        true,
                        3,
                        8
                    ) : "--"
            );
        }
    }, [currency, currencyData]);

    return [price, marketCap];
}

