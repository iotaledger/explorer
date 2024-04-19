import { useEffect, useState } from "react";
import { initialiseServices } from "~/index";

export function useInitServicesLoader() {
    const [isServicesLoaded, setServicesLoaded] = useState(false);

    useEffect(() => {
        (async () => {
            await initialiseServices();
            setServicesLoaded(true);
        })();
    }, []);

    return {
        isServicesLoaded,
    };
}
