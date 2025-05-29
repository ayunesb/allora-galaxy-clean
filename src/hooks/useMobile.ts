import { useMediaQuery } from "@/hooks/use-media-query";

export function useMobile() {
  const isMobile = useMediaQuery("(max-width: 768px)");
  return { isMobile };
}

export default useMobile;
