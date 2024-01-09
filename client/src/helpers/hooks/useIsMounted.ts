import { useEffect, useRef } from "react";

export const useIsMounted = () => {
  const isMounted = useRef(true);
  const unmount = () => {
    isMounted.current = false;
  };

  useEffect(() => unmount, []);

  return isMounted.current;
};
