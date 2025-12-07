import * as React from "react";

const MOBILE_BREAKPOINT = 768;

/**
 * Determines whether the current viewport width is less than MOBILE_BREAKPOINT.
 *
 * The hook attaches a media query listener and updates on viewport changes; it initially returns `false` until the effect runs.
 *
 * @returns `true` if the viewport width is less than MOBILE_BREAKPOINT, `false` otherwise.
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    mql.addEventListener("change", onChange);
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return !!isMobile;
}
