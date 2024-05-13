import { useEffect, useState } from "react";
import { useIsMounted } from "~helpers/hooks/useIsMounted";
import { ServiceFactory } from "~factories/serviceFactory";
import { STARDUST } from "~models/config/protocolVersion";
import { StardustApiClient } from "~services/stardust/stardustApiClient";

/**
 * Download transaction history for an address up to target date
 * @param network The Network in context
 * @param address The address
 * @param targetDate The target date
 * @returns The loading bool and an error message.
 */
export function useTransactionHistoryDownload(network: string, address: string, targetDate: string | null): [boolean, string?] {
    const isMounted = useIsMounted();
    const [apiClient] = useState(ServiceFactory.get<StardustApiClient>(`api-client-${STARDUST}`));
    const [error, setError] = useState<string>();
    const [isDownloading, setIsDownloading] = useState<boolean>(true);

    useEffect(() => {
        setIsDownloading(true);
        if (targetDate) {
            // eslint-disable-next-line no-void
            void (async () => {
                apiClient
                    .transactionHistoryDownload(network, address, targetDate)
                    .then((response) => {
                        if (response.raw) {
                            // eslint-disable-next-line no-void
                            void response.raw.blob().then((blob) => {
                                if (isMounted) {
                                    triggerDownload(blob, `txhistory-${address}`);
                                }
                            });
                        } else if (response.error && isMounted) {
                            setError(response.error);
                        }
                    })
                    .finally(() => {
                        setIsDownloading(false);
                    });
            })();
        } else {
            setIsDownloading(false);
        }
    }, [network, address, targetDate]);

    return [isDownloading, error];
}

export const triggerDownload = (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob);
    const tempDlElement = document.createElement("a");

    tempDlElement.href = url;
    tempDlElement.download = `${filename}.zip`;
    document.body.append(tempDlElement);
    tempDlElement.click();
    tempDlElement.remove();
};
