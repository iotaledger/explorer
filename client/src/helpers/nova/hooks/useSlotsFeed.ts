import moment from "moment";
import { useCallback, useEffect, useState } from "react";
import { ServiceFactory } from "~/factories/serviceFactory";
import { useIsMounted } from "~/helpers/hooks/useIsMounted";
import { ISlotCommitmentWrapper } from "~/models/api/nova/ILatestSlotCommitmentsResponse";
import { NOVA } from "~/models/config/protocolVersion";
import { NovaApiClient } from "~/services/nova/novaApiClient";
import { useNetworkInfoNova } from "../networkInfo";
import { useNovaTimeConvert } from "./useNovaTimeConvert";

const DEFAULT_SLOT_LIMIT = 10;
const MAX_LATEST_SLOT_COMMITMENTS = 20;

const CHECK_SLOT_INDEX_INTERVAL = 950;
const CHECK_SLOT_COMMITMENTS_INTERVAL = 3500;

export default function useSlotsFeed(slotsLimit: number = DEFAULT_SLOT_LIMIT): {
    currentSlotIndex: number | null;
    currentSlotProgressPercent: number | null;
    currentSlotTimeRange: { from: number; to: number } | null;
    latestSlotIndexes: number[] | null;
    latestSlotCommitments: ISlotCommitmentWrapper[];
} {
    const isMounted = useIsMounted();
    const { name: network } = useNetworkInfoNova((s) => s.networkInfo);
    const [apiClient] = useState(ServiceFactory.get<NovaApiClient>(`api-client-${NOVA}`));
    const { unixTimestampToSlotIndex, slotIndexToUnixTimeRange } = useNovaTimeConvert();
    const [currentSlotIndex, setCurrentSlotIndex] = useState<number | null>(null);
    const [latestSlotIndexes, setLatestSlotIndexes] = useState<number[] | null>(null);

    const [latestSlotCommitments, setLatestSlotCommitments] = useState<ISlotCommitmentWrapper[]>([]);

    const [currentSlotProgressPercent, setCurrentSlotProgressPercent] = useState<number | null>(null);
    const [currentSlotTimeRange, setCurrentSlotTimeRange] = useState<{ from: number; to: number } | null>(null);

    const [slotIndexCheckerHandle, setSlotIndexCheckerHandle] = useState<NodeJS.Timeout | null>(null);
    const [slotCommitmentsCheckerHandle, setSlotCommitmentsCheckerHandle] = useState<NodeJS.Timeout | null>(null);

    const checkCurrentSlotIndex = () => {
        if (unixTimestampToSlotIndex && slotIndexToUnixTimeRange) {
            const now = moment().unix();
            const currentSlotIndex = unixTimestampToSlotIndex(now);
            const slotTimeRange = slotIndexToUnixTimeRange(currentSlotIndex);

            const slotProgressPercent = Math.trunc(((now - slotTimeRange.from) / (slotTimeRange.to - 1 - slotTimeRange.from)) * 100);

            if (isMounted) {
                setCurrentSlotIndex(currentSlotIndex);
                setCurrentSlotProgressPercent(slotProgressPercent);
                setLatestSlotIndexes(Array.from({ length: slotsLimit - 1 }, (_, i) => currentSlotIndex - 1 - i));
                setCurrentSlotTimeRange(slotTimeRange);
            }
        }
    };

    const getLatestSlotCommitments = useCallback(async () => {
        if (apiClient) {
            const latestSlotCommitments = await apiClient.latestSlotCommitments(network);
            if (isMounted && latestSlotCommitments.slotCommitments && latestSlotCommitments.slotCommitments.length > 0) {
                let latestSlotCommitmentArray = latestSlotCommitments.slotCommitments.slice(0, MAX_LATEST_SLOT_COMMITMENTS);

                if (unixTimestampToSlotIndex && slotIndexToUnixTimeRange) {
                    latestSlotCommitmentArray = latestSlotCommitmentArray.map((slotCommitment) => {
                        const slotTimeRange = slotIndexToUnixTimeRange(slotCommitment.slotCommitment.slot);
                        return { ...slotCommitment, slotTimeRange };
                    });
                }

                setLatestSlotCommitments(latestSlotCommitmentArray);
            }
        }
    }, [network]);

    useEffect(() => {
        if (slotIndexCheckerHandle === null) {
            getLatestSlotCommitments();
            checkCurrentSlotIndex();

            const slotCommitmentCheckerHandle = setInterval(() => {
                getLatestSlotCommitments();
            }, CHECK_SLOT_COMMITMENTS_INTERVAL);

            const slotIndexIntervalHandle = setInterval(() => {
                checkCurrentSlotIndex();
            }, CHECK_SLOT_INDEX_INTERVAL);

            setSlotCommitmentsCheckerHandle(slotCommitmentCheckerHandle);
            setSlotIndexCheckerHandle(slotIndexIntervalHandle);
        }

        return () => {
            if (slotCommitmentsCheckerHandle) {
                clearInterval(slotCommitmentsCheckerHandle);
            }

            if (slotIndexCheckerHandle) {
                clearInterval(slotIndexCheckerHandle);
            }

            setSlotCommitmentsCheckerHandle(null);
            setSlotIndexCheckerHandle(null);
            setCurrentSlotIndex(null);
            setCurrentSlotProgressPercent(null);
            setLatestSlotIndexes(null);
            setLatestSlotCommitments([]);
        };
    }, []);

    return { currentSlotIndex, currentSlotProgressPercent, latestSlotIndexes, latestSlotCommitments, currentSlotTimeRange };
}
