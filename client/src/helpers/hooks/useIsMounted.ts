import { useEffect, useRef } from "react";

export const useIsMounted = () => {
    const isMounted = useRef(false);

    useEffect(() => {
      isMounted.current = true;
      return () => {
        console.log("unmounting");
        isMounted.current = false;
      };
    }, []);

    return isMounted;
};
