import { useEffect, useState } from "react";

/**
 *
 * @param mounted
 * @param array
 * @param pageSize
 * @param arraySetter
 */
export function usePagination<T>(
    mounted: React.MutableRefObject<boolean>,
    array: T[], pageSize: number,
    arraySetter: React.Dispatch<React.SetStateAction<T[]>>
): [number, React.Dispatch<React.SetStateAction<number>>] {
    const [pageNumber, setPageNumber] = useState<number>(1);
    useEffect(() => {
        const from = (pageNumber - 1) * pageSize;
        const to = from + pageSize;
        if (mounted.current) {
            arraySetter(array?.slice(from, to));
        }
    }, [array, pageNumber]);
    return [pageNumber, setPageNumber];
}
